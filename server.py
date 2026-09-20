#!/usr/bin/env python3
"""
IApprise — Serveur local & API de gestion des candidatures
- Enregistre chaque candidature dans candidatures.csv et candidatures.json
- Fournit l'API /api/candidates pour l'espace d'administration
- 100% Python Standard Library
"""

import http.server
import socketserver
import urllib.parse
import json
import csv
import os
import datetime

PORT = 8080
CSV_FILE = 'candidatures.csv'
JSON_FILE = 'candidatures.json'

FIELDNAMES = [
    'date_soumission',
    'fullname',
    'email',
    'phone',
    'country',
    'city',
    'school',
    'domain',
    'level',
    'python_level',
    'datascience_experience',
    'motivation',
    'future_goals',
    'problem_to_solve',
    'weekly_availability',
    'pc_access',
    'internet_access',
    'consent'
]

def init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, mode='w', newline='', encoding='utf-8-sig') as f:
            writer = csv.DictWriter(f, fieldnames=FIELDNAMES, delimiter=';')
            writer.writeheader()

def get_all_candidates():
    candidates = []
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                candidates = json.load(f)
        except Exception:
            candidates = []
    elif os.path.exists(CSV_FILE):
        try:
            with open(CSV_FILE, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f, delimiter=';')
                for row in reader:
                    candidates.append(row)
        except Exception:
            candidates = []
    return candidates

class IAppriseHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/candidates':
            candidates = get_all_candidates()
            response = json.dumps(candidates, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
        elif self.path == '/api/export-csv':
            if os.path.exists(CSV_FILE):
                with open(CSV_FILE, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/csv; charset=utf-8-sig')
                self.send_header('Content-Disposition', 'attachment; filename="candidatures_iapprise.csv"')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "CSV file not found")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path in ['/api/candidature', '/candidature', '/']:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            content_type = self.headers.get('Content-Type', '')

            data = {}
            if 'application/json' in content_type:
                try:
                    data = json.loads(post_data.decode('utf-8'))
                except Exception:
                    data = {}
            elif 'multipart/form-data' in content_type:
                try:
                    boundary = content_type.split("boundary=")[1].encode()
                    parts = post_data.split(b'--' + boundary)
                    for part in parts:
                        if b'name="' in part:
                            header_part, value_part = part.split(b'\r\n\r\n', 1)
                            name = header_part.split(b'name="')[1].split(b'"')[0].decode('utf-8')
                            value = value_part.rstrip(b'\r\n--').rstrip(b'\r\n').decode('utf-8', errors='ignore')
                            data[name] = value
                except Exception:
                    pass
            else:
                parsed = urllib.parse.parse_qs(post_data.decode('utf-8'))
                for k, v in parsed.items():
                    data[k] = v[0] if v else ''

            now_str = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            data['date_soumission'] = now_str

            row = {field: data.get(field, '') for field in FIELDNAMES}

            init_csv()
            with open(CSV_FILE, mode='a', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=FIELDNAMES, delimiter=';')
                writer.writerow(row)

            all_records = get_all_candidates()
            all_records.append(row)
            with open(JSON_FILE, 'w', encoding='utf-8') as jf:
                json.dump(all_records, jf, ensure_ascii=False, indent=2)

            print(f"[NOUVELLE CANDIDATURE] {now_str} - {data.get('fullname', 'Inconnu')} ({data.get('email', '')})")

            response = json.dumps({
                "status": "success",
                "message": "Candidature enregistrée avec succès."
            }).encode('utf-8')

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
        else:
            self.send_error(404, "Not Found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    init_csv()
    with socketserver.TCPServer(("", PORT), IAppriseHandler) as httpd:
        print(f"=== SERVEUR IAPPRISE ACTIF SUR http://localhost:{PORT} ===")
        print(f"=== Espace Admin : http://localhost:{PORT}/admin.html ===")
        httpd.serve_forever()
