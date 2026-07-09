import streamlit as st
import pandas as pd
from ultralytics import YOLO
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.patches as patches

st.set_page_config(page_title="Smart Shelf CV - Planogram Check", layout="wide")
st.title("Smart Shelf CV — เทียบ Planogram")
st.caption("อัปโหลดรูป reference (ชั้นวางตอนถูกต้อง) กับรูป test (ที่จะเช็ค) แล้วระบบจะเทียบให้ทีละช่อง")


@st.cache_resource
def load_model(model_path):
    return YOLO(model_path)


def analyze_image(model, image, grid_rows, grid_cols, confidence):
    result = model.predict(source=image, conf=confidence, verbose=False)[0]
    img_w, img_h = image.size

    items = []
    for box in result.boxes:
        cx, cy, w, h = box.xywh[0].tolist()
        class_name = result.names[int(box.cls[0])]
        row = min(int(cy / img_h * grid_rows), grid_rows - 1)
        col = min(int(cx / img_w * grid_cols), grid_cols - 1)

        items.append({
            'center_x': cx, 'center_y': cy, 'width': w, 'height': h,
            'row': row, 'col': col,
            'class': class_name,
            'confidence': float(box.conf[0]),
        })
    return items


def to_grid_map(items):
    grid = {}
    for it in items:
        grid[(it['row'], it['col'])] = it
    return grid


def compare(reference_items, test_items):
    reference_grid = to_grid_map(reference_items)
    test_grid = to_grid_map(test_items)
    all_cells = set(reference_grid.keys()) | set(test_grid.keys())

    report = []
    for row, col in sorted(all_cells):
        ref_item = reference_grid.get((row, col))
        test_item = test_grid.get((row, col))

        if ref_item and test_item:
            status = 'correct' if ref_item['class'] == test_item['class'] else 'misplaced'
        elif ref_item and not test_item:
            status = 'missing'
        else:
            status = 'extra'

        report.append({
            'row': row, 'col': col,
            'reference_class': ref_item['class'] if ref_item else None,
            'test_class': test_item['class'] if test_item else None,
            'status': status,
        })
    return report


def draw_result(test_image, test_items, report, grid_rows, grid_cols):
    img_w, img_h = test_image.size
    fig, ax = plt.subplots(figsize=(10, 7))
    ax.imshow(test_image)

    for det in test_items:
        left = det['center_x'] - det['width'] / 2
        top = det['center_y'] - det['height'] / 2
        rect = patches.Rectangle((left, top), det['width'], det['height'],
                                  linewidth=2, edgecolor='cyan', facecolor='none')
        ax.add_patch(rect)
        ax.text(left, top - 5, det['class'], color='cyan', fontsize=9)

    cell_w, cell_h = img_w / grid_cols, img_h / grid_rows
    status_color = {'correct': 'lime', 'misplaced': 'red', 'missing': 'orange', 'extra': 'red'}
    for item in report:
        color = status_color[item['status']]
        x, y = item['col'] * cell_w, item['row'] * cell_h
        rect = patches.Rectangle((x, y), cell_w, cell_h,
                                  linewidth=2, edgecolor=color, facecolor='none', linestyle='--')
        ax.add_patch(rect)
        ax.text(x + 5, y + 20, item['status'], color=color, fontsize=10, weight='bold')

    ax.axis('off')
    return fig


with st.sidebar:
    st.header("ตั้งค่า")
    model_path = st.text_input("Model path (.pt)", "best.pt")
    confidence = st.slider("Confidence threshold", 0.0, 1.0, 0.4, 0.05)
    grid_rows = st.number_input("จำนวนแถว (rows)", min_value=1, value=2)
    grid_cols = st.number_input("จำนวนคอลัมน์ (cols)", min_value=1, value=4)

col1, col2 = st.columns(2)
with col1:
    reference_upload = st.file_uploader("รูป Reference (ถูกต้อง)", type=["jpg", "jpeg", "png"], key="ref")
    reference_image = Image.open(reference_upload).convert("RGB") if reference_upload else None
    if reference_image:
        st.image(reference_image, caption="Reference", use_container_width=True)
with col2:
    test_upload = st.file_uploader("รูป Test (ที่จะเช็ค)", type=["jpg", "jpeg", "png"], key="test")
    test_image = Image.open(test_upload).convert("RGB") if test_upload else None
    if test_image:
        st.image(test_image, caption="Test", use_container_width=True)

if st.button("ตรวจสอบ", type="primary"):
    if reference_image is None or test_image is None:
        st.warning("กรุณาอัปโหลดรูปทั้ง reference และ test ก่อน")
    else:
        model = load_model(model_path)

        reference_items = analyze_image(model, reference_image, grid_rows, grid_cols, confidence)
        test_items = analyze_image(model, test_image, grid_rows, grid_cols, confidence)
        report = compare(reference_items, test_items)

        st.subheader("ผลลัพธ์")
        fig = draw_result(test_image, test_items, report, grid_rows, grid_cols)
        st.pyplot(fig)

        counts = {s: sum(1 for r in report if r['status'] == s) for s in ['correct', 'misplaced', 'missing', 'extra']}
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("ถูกต้อง", counts['correct'])
        m2.metric("ผิดตำแหน่ง", counts['misplaced'])
        m3.metric("ขาด", counts['missing'])
        m4.metric("แปลกปลอม", counts['extra'])

        st.subheader("รายละเอียดทีละช่อง")
        st.dataframe(pd.DataFrame(report), use_container_width=True)
