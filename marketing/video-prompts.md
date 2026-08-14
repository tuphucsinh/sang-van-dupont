# Veo Video Prompts — SangDupont (2026-08-14)

> Dùng ảnh THẬT từ website làm reference (image-to-video). Veo giữ sản phẩm, prompt điều khiển chuyển động/ánh sáng/nền.
> Ảnh chính: `out/assets/img/hero.jpg` (bật lửa trong hộp — cinematic). Ảnh phụ: `img_08.jpg`, `img_03.jpg`.
> Lưu ý: KHÔNG nhắc tên thương hiệu trong prompt (Veo sẽ tự đổi/bóp méo logo) — dùng "vintage French luxury lighter".

---

## 1. HERO — Cinematic bật lửa (dùng cho đầu trang / section hero)
**Input image**: hero.jpg · **Ratio**: 16:9 · **Duration**: 6-8s

```
Cinematic luxury product commercial, 6 seconds, 16:9, high-end watch-advertisement style.
The vintage lighter with black lacquer body and warm gold metal trim from the reference image
slowly rotates 15 degrees as the camera pushes in gently, dolly forward.
A warm amber flame ignites at the top with a soft click, flame flickering delicately.
Dark charcoal background, thin wisps of smoke curling upward, golden bokeh particles floating.
Dramatic chiaroscuro lighting, gold rim light tracing the metal edges.
Slow motion, shallow depth of field, 35mm film aesthetic, moody, sophisticated, black and gold palette.
No text, no logo, no watermark.
```

---

## 2. PRODUCT — Xoay 360° trên bàn xoay (dùng cho trang sản phẩm)
**Input image**: hero.jpg (hoặc img_08.jpg nếu muốn có hộp) · **Ratio**: 1:1 · **Duration**: 8-10s (loop)

```
Luxury product turntable shot, 8 seconds, square, seamless loop.
The vintage black lacquer lighter with gold metal trim from the reference image
stands on a dark reflective glass turntable, rotating slowly 360 degrees, smooth and steady.
Mirror reflection below, deep black studio background with soft golden gradient rim lighting.
Light sweeps across the engraved gold details creating sparkling highlights.
Premium jewelry advertisement aesthetic, ultra sharp, minimalist composition.
No text, no logo, no watermark.
```

---

## 3. MACRO — Chi tiết khắc kim loại (dùng cho section "Bảo dưỡng / Thủ công")
**Input image**: img_03.jpg (hoặc hero.jpg crop) · **Ratio**: 9:16 hoặc 1:1 · **Duration**: 5-6s

```
Extreme macro luxury detail shot, 5 seconds.
Camera slowly tilts and pushes closer over the black lacquer surface and gold engraved trim
of the vintage lighter from the reference image.
Raking light sweeps across the engraved metal, making engraved lines sparkle one by one.
Gold dust particles floating in dark air, dramatic side lighting, cinematic depth.
Ultra premium watch commercial aesthetic, black and gold palette, shallow focus.
No text, no logo, no watermark.
```

---

## 4. UNBOXING — Mở hộp quà (dùng cho dịp quà tặng / story)
**Input image**: img_08.jpg (hộp + bật lửa) · **Ratio**: 9:16 · **Duration**: 7s

```
Elegant unboxing cinematic, 7 seconds, vertical.
A vintage black lacquer lighter with gold trim resting in an open box with ochre velvet lining,
from the reference image. Soft golden light, lid gently closing in slow motion.
Camera orbits slowly around the box, leather accessories around softly blurred.
Luxury gift atmosphere, warm amber tones, shallow depth of field, premium commercial.
No text, no logo, no watermark.
```

---

## Tips dùng Veo
1. **Upload ảnh thật trước** (image-to-video) → paste prompt — Veo giữ đúng sản phẩm + màu.
2. Tạo **2-3 biến thể mỗi prompt** (bấm regenerate) — chọn clip đẹp nhất; Veo hay cho khác nhau.
3. Muốn yên tâm về màu sắc (vintage!) → dùng clip nào sản phẩm KHÔNG đổi màu — nếu Veo đổi màu kim loại → bỏ clip đó, chọn clip khác.
4. Output 1080p → nén H.264/H.265 ~3-6MB cho web, kèm poster ảnh hero.jpg.
5. Nếu anh có ảnh THẬT bật lửa ĐANG BẬT LỬA (ngọn lửa) → dùng ảnh đó làm input cho prompt 1 sẽ wow hơn nhiều (Veo animate ngọn lửa từ ảnh thật).
