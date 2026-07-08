# Workflow: Smart Shelf CV Demo (7 วัน)

**ทีม:** Software Eng 1 คน | AI Eng 2 คน
**เป้าหมาย:** Demo ระบบตรวจจับสินค้าบนชั้นวางเทียบกับ Planogram

---

## บทบาทและความรับผิดชอบ

| บทบาท | ผู้รับผิดชอบหลัก | งานหลัก |
|---|---|---|
| **AI Eng 1** | Object Detection | หา/เตรียม dataset, เทรน/fine-tune โมเดล YOLO |
| **AI Eng 2** | Matching Logic + Evaluation | แปลงผล detection เป็น grid, เทียบกับ planogram, วัด metrics |
| **Software Eng** | Backend + Dashboard | API, เชื่อมโมเดล, หน้าแสดงผล |

---

## Day 1 — Setup + เตรียมข้อมูล

- [ ] **AI Eng 1:** หา dataset (SKU-110k หรือถ่ายเอง 20-30 รูป), ติดตั้ง YOLOv8, ทดสอบ pre-trained model เบื้องต้น
- [ ] **AI Eng 2:** ออกแบบ planogram format (JSON), เตรียม labeling tool (Roboflow/LabelImg), จำกัดสินค้า 3-5 ประเภทที่ต่างกันชัดเจน
- [ ] **Software Eng:** Setup FastAPI project + endpoint โครงร่าง (`/upload-shelf-image`, `/get-planogram`), setup frontend โครงร่าง

**Checkpoint สิ้นวัน:** มี dataset พร้อมใช้, มี planogram format, มี project skeleton รันได้

---

## Day 2-3 — เทรน/ปรับโมเดล

- [ ] **AI Eng 1:** Fine-tune YOLOv8 จาก pre-trained weight (`yolov8n.pt`), เทรน ~30 epochs, เก็บ mAP และดู class ที่ detect พลาด
- [ ] **AI Eng 2:** เขียนฟังก์ชันแปลง bounding box → grid position (row, col), เขียน matching logic (ตรง/ขาด/ผิดตำแหน่ง)
- [ ] **Software Eng:** ทำ endpoint เชื่อมโมเดลจริง (รับรูป → inference → คืนผลดิบ), เริ่มหน้าแสดงผล (bounding box overlay)

**Checkpoint สิ้นวัน 3:** โมเดล detect ได้ในระดับใช้งานได้, มี matching logic พร้อมใช้, endpoint คืนผล detection ดิบได้

---

## Day 4-5 — รวมระบบ (Integration)

- [ ] AI Eng 1 ส่งโมเดลที่เทรนเสร็จให้ Software Eng
- [ ] AI Eng 2 ใส่ matching logic เข้า pipeline ต่อจากผล detection
- [ ] Software Eng เชื่อม frontend-backend ให้ครบ flow: อัปโหลดรูป → เห็น bounding box → เห็นสรุปสถานะชั้นวาง

```python
@app.post("/analyze-shelf")
async def analyze_shelf(file: UploadFile):
    image = save_temp_file(file)
    detections = model.predict(image)          # AI Eng 1
    grid_positions = map_to_grid(detections)     # AI Eng 2
    result = compare_with_planogram(grid_positions, planogram)  # AI Eng 2
    return result
```

**Checkpoint สิ้นวัน 5:** Flow เต็มรูปแบบทำงานได้ end-to-end อย่างน้อย 1 รอบ

---

## Day 6 — ทดสอบและแก้บั๊ก

- [ ] ทดสอบกับรูปจริงหลายสภาพ (แสงต่าง, มุมกล้องต่าง)
- [ ] AI Eng 1 + 2 ช่วยกันดูจุดที่ detection พลาด ปรับ confidence threshold หรือ fine-tune เพิ่ม
- [ ] Software Eng ปรับ UI ให้อ่านง่าย (สีเขียว = ตรง, สีแดง = ขาด/ผิดตำแหน่ง)

**Checkpoint สิ้นวัน:** ระบบเสถียรพอสำหรับ demo, UI อ่านผลง่าย

---

## Day 7 — เตรียม Demo

- [ ] เลือกรูปทดสอบที่ demo ออกมาดี (detect แม่น)
- [ ] เตรียม 1 เคส "จงใจทำผิด" (เอาสินค้าออก/สลับตำแหน่ง) เพื่อโชว์ว่าระบบจับได้จริง
- [ ] เตรียม slide อธิบาย pipeline
- [ ] Dry run demo ทั้งทีม

**Checkpoint สิ้นวัน:** พร้อม demo จริง

---

## แผนสำรอง (Risk Mitigation)

| ความเสี่ยง | แผนสำรอง |
|---|---|
| Fine-tune ไม่ทัน | ใช้ pre-trained YOLO (COCO classes) ตรวจแค่ "มีวัตถุในช่องไหม" แทนการระบุชนิดสินค้า |
| Dataset ไม่พอ | ใช้ dataset สาธารณะ (SKU-110k, Grocery Store Dataset) แทนถ่ายเอง |
| AI Eng 2 งานเบาช่วงแรก | ช่วย AI Eng 1 เตรียม/label data ในวัน 1-2 ก่อนเริ่มงานตัวเองในวัน 3 |

---

## Tech Stack สรุป

- **Detection:** YOLOv8 (ultralytics)
- **Backend:** Python FastAPI
- **Frontend:** React หรือ HTML/JS พื้นฐาน
- **Dataset:** SKU-110k หรือถ่ายเอง
