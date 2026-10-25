from PIL import Image
import numpy as np
from pathlib import Path

out = Path("src/assets/noise.png")
out.parent.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)
n = 96
values = rng.integers(0, 256, (n, n, 1), dtype=np.uint8)
alpha = np.full((n, n, 1), 26, dtype=np.uint8)
image = np.concatenate([values, values, values, alpha], axis=2)
Image.fromarray(image, "RGBA").save(out, optimize=True)
print(f"{out}: {out.stat().st_size} bytes")
