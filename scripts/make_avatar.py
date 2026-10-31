import os
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from rembg import new_session, remove

src_path = r"C:/Users/Aplus/.gemini/antigravity/brain/5ec0bce9-95aa-4ff7-9894-57f1a7e17952/.user_uploaded/media_1793393460481_99dc3562.jpg"
out_dir = r"public"
os.makedirs(out_dir, exist_ok=True)

print(f"Loading {src_path}...")
img = Image.open(src_path).convert("RGBA")
w, h = img.size
print(f"Original size: {w}x{h}")

# Focus on upper torso & head
crop_size = int(w * 0.95)
left = (w - crop_size) // 2
top = int(h * 0.04)
cropped = img.crop((left, top, left + crop_size, top + crop_size))

print("Removing background with lightweight u2netp...")
session = new_session("u2netp")
cutout = remove(cropped, session=session)

cutout_path = os.path.join(out_dir, "avatar_cutout.png")
cutout.save(cutout_path)
print(f"Saved cutout: {cutout_path}")

badge_size = 512
border_w = 12

# 1. Dark tech background with emerald/mint radial glow
bg = Image.new("RGBA", (badge_size, badge_size), (0, 0, 0, 0))
bg_draw = ImageDraw.Draw(bg)
center = badge_size // 2

for r in range(badge_size // 2, 0, -2):
    factor = r / (badge_size // 2)
    red = int(10 + (1 - factor) * 16)
    green = int(22 + (1 - factor) * 60)
    blue = int(26 + (1 - factor) * 55)
    bg_draw.ellipse([center - r, center - r, center + r, center + r], fill=(red, green, blue, 255))

# 2. Resize and place cutout
scale = (badge_size - border_w * 2) / crop_size
new_w = int(crop_size * scale)
new_h = int(crop_size * scale)
cutout_resized = cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)

enhancer = ImageEnhance.Contrast(cutout_resized)
cutout_enhanced = enhancer.enhance(1.08)

# 3. Paste on background
composite = bg.copy()
offset_x = (badge_size - new_w) // 2
offset_y = border_w + 6
composite.paste(cutout_enhanced, (offset_x, offset_y), cutout_enhanced)

# 4. Circular mask
mask = Image.new("L", (badge_size, badge_size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.ellipse([border_w // 2, border_w // 2, badge_size - border_w // 2, badge_size - border_w // 2], fill=255)

final_badge = Image.new("RGBA", (badge_size, badge_size), (0, 0, 0, 0))
final_badge.paste(composite, (0, 0), mask)

# 5. Neon gradient / multi-ring tech border
final_draw = ImageDraw.Draw(final_badge)
final_draw.ellipse(
    [border_w // 2, border_w // 2, badge_size - border_w // 2, badge_size - border_w // 2],
    outline=(16, 185, 129, 255),  # Emerald (#10b981)
    width=border_w,
)
final_draw.ellipse(
    [border_w + 3, border_w + 3, badge_size - border_w - 3, badge_size - border_w - 3],
    outline=(6, 182, 212, 160),  # Cyan (#06b6d4)
    width=2,
)

badge_path = os.path.join(out_dir, "avatar_badge.png")
final_badge.save(badge_path)
final_badge.save(os.path.join(out_dir, "main.png"))
print(f"Generated successfully: {badge_path} and public/main.png")
