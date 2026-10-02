"""Generate the public questionnaire QR locally; no answers go to a QR service."""
from pathlib import Path
import qrcode

URL = 'https://romantic16.netlify.app/'
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=8, border=4)
qr.add_data(URL)
qr.make(fit=True)
destination = Path(__file__).resolve().parents[1] / 'dist/assets/questionnaire-qr.png'
qr.make_image(fill_color='#251923', back_color='white').save(destination)
print(f'QR: {qr.modules_count} modules + 4-module quiet zone; {destination}')
