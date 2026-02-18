"""Generate a polished desktop icon for Traka Launchpad.

Creates a modern rounded-square app icon with the rocket logo on a dark
gradient background, exported as a multi-resolution .ico file.
"""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROCKET_PATH = os.path.join(ROOT, "public", "launchpad-rocket-logo.png")
OUTPUT_ICO = os.path.join(ROOT, "traka-launchpad.ico")

TRAKA_ORANGE = (255, 131, 0)
BG_DARK = (15, 15, 20)
BG_LIGHTER = (25, 25, 35)
CANVAS = 512


def rounded_rect_mask(size, radius):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (size[0] - 1, size[1] - 1)], radius=radius, fill=255)
    return mask


def create_gradient_bg(size):
    img = Image.new("RGBA", (size, size), BG_DARK + (255,))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / size
        r = int(BG_DARK[0] + (BG_LIGHTER[0] - BG_DARK[0]) * t)
        g = int(BG_DARK[1] + (BG_LIGHTER[1] - BG_DARK[1]) * t)
        b = int(BG_DARK[2] + (BG_LIGHTER[2] - BG_DARK[2]) * t)
        draw.line([(0, y), (size - 1, y)], fill=(r, g, b, 255))
    return img


def tint_image(img, color):
    """Tint a grayscale/alpha image with the given color."""
    r_ch, g_ch, b_ch, a_ch = img.split()
    tinted = Image.merge("RGBA", (
        r_ch.point(lambda p: int(p / 255.0 * color[0])),
        g_ch.point(lambda p: int(p / 255.0 * color[1])),
        b_ch.point(lambda p: int(p / 255.0 * color[2])),
        a_ch,
    ))
    return tinted


def create_icon():
    bg = create_gradient_bg(CANVAS)
    mask = rounded_rect_mask((CANVAS, CANVAS), radius=100)
    bg.putalpha(mask)

    # Subtle orange glow at bottom
    glow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for i in range(80):
        alpha = int(12 * (1 - i / 80))
        y = CANVAS - 80 + i
        glow_draw.line([(40, y), (CANVAS - 40, y)], fill=TRAKA_ORANGE + (alpha,))
    bg = Image.alpha_composite(bg, glow)
    bg.putalpha(mask)

    # Load and tint rocket to orange
    rocket = Image.open(ROCKET_PATH).convert("RGBA")
    rocket = tint_image(rocket, TRAKA_ORANGE)

    # Size the rocket to fill ~68% of the canvas, centered with slight upward offset
    rocket_size = int(CANVAS * 0.68)
    rocket = rocket.resize((rocket_size, rocket_size), Image.LANCZOS)

    offset_x = (CANVAS - rocket_size) // 2
    offset_y = (CANVAS - rocket_size) // 2 - 15
    bg.paste(rocket, (offset_x, offset_y), rocket)

    # Subtle border ring
    border_overlay = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border_overlay)
    border_draw.rounded_rectangle(
        [(1, 1), (CANVAS - 2, CANVAS - 2)],
        radius=100,
        outline=TRAKA_ORANGE + (40,),
        width=2,
    )
    bg = Image.alpha_composite(bg, border_overlay)
    bg.putalpha(mask)

    # Generate multi-resolution ICO
    sizes = [16, 24, 32, 48, 64, 128, 256]
    frames = []
    for s in sizes:
        frame = bg.copy().resize((s, s), Image.LANCZOS)
        frames.append(frame)

    # Pillow ICO: first image is the base, append_images adds the rest
    frames[-1].save(
        OUTPUT_ICO,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=frames[:-1],
    )
    print(f"Icon saved to: {OUTPUT_ICO}")
    print(f"Sizes: {', '.join(f'{s}x{s}' for s in sizes)}")


if __name__ == "__main__":
    create_icon()
