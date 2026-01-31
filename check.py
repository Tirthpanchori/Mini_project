import pdfplumber

with pdfplumber.open("AE2007_ocr.pdf") as pdf:
    for i, page in enumerate(pdf.pages[:2]):
        print(f"\n--- PAGE {i+1} ---")
        print(page.extract_text())
