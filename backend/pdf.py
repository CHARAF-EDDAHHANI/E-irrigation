# api/api_folder.py
@api_folder.route("/folders/<folder_id>/pdf", methods=["GET"])
@require_auth
def download_pdf(folder_id):
    folder = get_folder_by_id(folder_id)
    pdf_bytes = generate_conception_pdf(folder.to_dict())  # appelle le générateur
    return send_file(pdf_bytes, mimetype="application/pdf",
                     download_name=f"fiche_{folder_id}.pdf")