"""
BioSecure Farm - Synthetic Data Generator
Generates all 10 collections for MongoDB (localhost:27017)
Indian States: Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana
"""
import json, random, csv, os, sys
from datetime import datetime, timedelta

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

random.seed(42)

STATE_DISTRICTS = {
    "Tamil Nadu":     [("Coimbatore",11.0168,76.9558),("Salem",11.6643,78.1460),
                       ("Erode",11.3410,77.7172),("Chennai",13.0827,80.2707),
                       ("Madurai",9.9252,78.1198),("Trichy",10.7905,78.7047)],
    "Kerala":         [("Kochi",9.9312,76.2673),("Thiruvananthapuram",8.5241,76.9366),
                       ("Kozhikode",11.2588,75.7804),("Thrissur",10.5276,76.2144)],
    "Karnataka":      [("Bengaluru",12.9716,77.5946),("Mysuru",12.2958,76.6394),
                       ("Hubli",15.3647,75.1240),("Mangaluru",12.9141,74.8560)],
    "Andhra Pradesh": [("Vijayawada",16.5062,80.6480),("Visakhapatnam",17.6868,83.2185),
                       ("Guntur",16.3067,80.4365),("Tirupati",13.6288,79.4192)],
    "Telangana":      [("Hyderabad",17.3850,78.4867),("Warangal",17.9784,79.5941),
                       ("Nizamabad",18.6725,78.0941),("Karimnagar",18.4386,79.1288)],
}
ALL_LOCATIONS = [(s,d,lat,lng) for s,dlist in STATE_DISTRICTS.items() for d,lat,lng in dlist]

FARM_NAMES_PIG = [
    "Sunrise Pig Farm","Green Valley Swine","Heritage Pork Farm","Golden Hog Farm",
    "Lakshmi Pig Farm","Sai Swine Farm","Ravi Pig Farm","Annamalai Pig Farm",
    "Murugan Swine Farm","Kaveri Pig Farm","Nandini Pig Farm","Bharath Pig Farm",
    "Vijay Swine Farm","Priya Pig Farm","Arjun Pig Farm","Selvi Pig Farm",
    "Karthik Swine Farm","Deepa Pig Farm","Suresh Pig Farm","Meena Pig Farm",
    "Balaji Pig Farm","Chitra Swine Farm","Saravanan Pig Farm","Gopal Pig Farm",
    "Mahesh Swine Farm","Naresh Pig Farm","Prasad Pig Farm","Srinivas Swine Farm",
    "Chandran Pig Farm","Durai Pig Farm",
]
FARM_NAMES_POULTRY = [
    "Sunrise Poultry","Green Feather Farm","Heritage Broiler Farm","Golden Egg Farm",
    "Lakshmi Poultry","Sai Layer Farm","Ravi Broiler Farm","Annamalai Poultry",
    "Murugan Layer Farm","Kaveri Poultry","Nandini Broiler Farm","Bharath Poultry",
    "Vijay Layer Farm","Priya Poultry","Arjun Broiler Farm","Selvi Poultry",
    "Karthik Layer Farm","Deepa Poultry","Suresh Broiler Farm","Meena Poultry",
    "Balaji Poultry","Chitra Layer Farm","Saravanan Broiler Farm","Gopal Poultry",
    "Mahesh Layer Farm","Naresh Poultry","Prasad Broiler Farm","Srinivas Poultry",
    "Chandran Layer Farm","Durai Poultry",
]

FIRST_NAMES = [
    "Ravi","Suresh","Priya","Kavitha","Murugan","Lakshmi","Arjun","Deepa","Karthik",
    "Meena","Vijay","Selvi","Anand","Geetha","Ramesh","Saranya","Kumar","Nithya",
    "Bala","Vani","Siva","Radha","Mani","Usha","Ganesh","Parvathi","Senthil","Kamala",
    "Dinesh","Revathi","Arun","Sumathi","Rajesh","Malathi","Venkat","Padma","Mohan",
    "Vasantha","Harish","Indira","Prakash","Jaya","Sathish","Latha","Manoj","Rekha",
    "Naveen","Shanthi","Praveen","Bhavani","Ashok","Nalini","Vinod","Savitha","Sunil",
    "Hema","Ajay","Vimala","Rohit","Saroja","Vivek","Mythili","Kiran","Thenmozhi",
    "Balaji","Chitra","Saravanan","Anitha","Gopal","Nirmala","Mahesh","Kaveri",
    "Naresh","Sudha","Prasad","Vasuki","Srinivas","Meenakshi","Chandran","Ambika",
    "Durai","Rajeswari","Selvam","Kousalya","Muthu","Saraswathi","Pandi","Vennila",
    "Sekar","Tamilarasi","Rajan","Ponni","Natarajan","Mangai","Perumal","Devaki",
    "Shankar","Rukmini","Annamalai","Bhuvana","Palani","Sarala","Sundaram","Vasumathi",
]
LAST_NAMES = [
    "Kumar","Raj","Devi","Pillai","Nair","Reddy","Sharma","Patel","Naidu","Iyer",
    "Iyengar","Krishnan","Murugan","Selvam","Rajan","Pandian","Arumugam","Subramanian",
    "Venkatesh","Balakrishnan","Natarajan","Sundaram","Annamalai","Palaniswamy",
    "Ramasamy","Govindasamy","Duraisamy","Karuppasamy","Marimuthu","Thangavel",
]
VET_NAMES = [
    "Dr. Ravi Kumar","Dr. Priya Nair","Dr. Suresh Reddy","Dr. Kavitha Pillai",
    "Dr. Murugan Selvam","Dr. Lakshmi Iyer","Dr. Arjun Sharma","Dr. Deepa Krishnan",
    "Dr. Karthik Naidu","Dr. Meena Venkatesh","Dr. Vijay Balakrishnan","Dr. Selvi Natarajan",
    "Dr. Anand Subramanian","Dr. Geetha Ramasamy","Dr. Ramesh Duraisamy",
]

DISEASES     = ["Bird Flu","African Swine Fever","Foot and Mouth Disease","Swine Influenza","Newcastle Disease"]
PIG_BREEDS   = ["Large White","Duroc","Landrace","Hampshire","Berkshire","Pietrain","Tamworth","Chester White"]
POULTRY_BREEDS=["Ross 308","Cobb 500","Hy-Line Brown","Lohmann Brown","Giriraja","Aseel","Kadaknath","Vanraja"]
VACCINE_PIG  = ["CSF Vaccine","PRRS Vaccine","PCV2 Vaccine","FMD Vaccine","Erysipelas Vaccine","Mycoplasma Vaccine"]
VACCINE_POULTRY=["Newcastle Disease Vaccine","IBD Vaccine","Marek's Disease Vaccine","Avian Influenza Vaccine","IB Vaccine","Fowl Cholera Vaccine"]

OBSERVATIONS = [
    "Animals appear healthy with no visible signs of disease.",
    "Minor respiratory symptoms observed in 2-3 animals, monitoring recommended.",
    "Vaccination records up to date, biosecurity measures adequate.",
    "Feed and water quality satisfactory, waste management needs improvement.",
    "Slight decrease in feed intake noted, further observation required.",
    "All animals vaccinated as per schedule, good health status.",
    "Litter management needs attention, moisture levels elevated.",
    "Biosecurity entry protocols not fully followed, corrective action needed.",
    "Suspected early signs of respiratory infection, samples collected.",
    "Farm infrastructure in good condition, minor repairs recommended.",
]
RECOMMENDATIONS = [
    "Continue current vaccination schedule and maintain biosecurity protocols.",
    "Improve ventilation in housing units to reduce respiratory risk.",
    "Implement strict visitor control and disinfection procedures.",
    "Schedule follow-up inspection in 14 days to monitor health status.",
    "Upgrade waste management system to prevent disease spread.",
    "Ensure cold chain maintenance for all vaccines.",
    "Conduct immediate PRRS screening for affected animals.",
    "Increase frequency of biosecurity assessments to monthly.",
    "Provide training to farm workers on disease recognition.",
    "Submit samples to regional veterinary laboratory for confirmation.",
]
ALERT_TITLES = [
    "Bird Flu Outbreak Alert - Immediate Action Required",
    "African Swine Fever Movement Restriction Advisory",
    "Newcastle Disease Vaccination Drive - Q3 2025",
    "Swine Influenza Surveillance Notice",
    "Foot and Mouth Disease Containment Protocol",
    "Mandatory Biosecurity Inspection - All Farms",
    "HPAI Heightened Surveillance Zone Declared",
    "Emergency Vaccination Campaign - Poultry Farms",
    "Disease-Free Zone Certification Renewal",
    "Livestock Movement Restriction - District Level",
]
ALERT_MESSAGES = [
    "Immediate quarantine and movement restriction imposed. All farms must report suspicious symptoms within 24 hours.",
    "All pig farms in the district must implement enhanced biosecurity measures. No movement of animals without prior approval.",
    "Mandatory vaccination drive initiated. All poultry farms must complete vaccination within 30 days.",
    "Heightened surveillance required. Report any unusual mortality or symptoms to the district veterinary office.",
    "Containment protocol activated. Affected farms under quarantine. Compensation scheme available for affected farmers.",
    "All registered farms must undergo mandatory biosecurity inspection by end of month.",
    "Movement of poultry and poultry products restricted until further notice.",
    "Emergency vaccination teams deployed. Contact district office for scheduling.",
    "Annual disease-free zone certification renewal process initiated. Submit required documents.",
    "Livestock movement restricted within and between affected districts. Permits required for all movements.",
]
NOTIF_TITLES = [
    "Vaccination Due Reminder","Disease Alert in Your District","Biosecurity Score Updated",
    "Inspection Scheduled","Government Advisory Issued","AI Health Alert",
    "Report Ready for Download","New Veterinarian Assigned","Farm Registration Approved",
    "Compliance Certificate Issued","Emergency Alert","Vaccination Completed",
]
NOTIF_MESSAGES = [
    "Your vaccination for Newcastle Disease is due in 7 days. Please contact your assigned veterinarian.",
    "A disease outbreak has been reported in your district. Please follow biosecurity protocols.",
    "Your farm biosecurity score has been updated. Check the latest assessment.",
    "A farm inspection has been scheduled for next week. Please ensure all records are ready.",
    "A new government advisory has been issued for your district. Please review immediately.",
    "AI analysis detected potential health risk in your livestock. Immediate attention required.",
    "Your monthly health report is ready for download.",
    "A new veterinarian has been assigned to your farm. Contact details shared.",
    "Your farm registration has been approved. Welcome to BioSecure Farm.",
    "Your compliance certificate has been issued for this quarter.",
    "Emergency alert: Disease outbreak confirmed nearby. Implement quarantine immediately.",
    "Vaccination campaign completed successfully. Records updated.",
]

def rand_date(start_year=2024, end_year=2025):
    start = datetime(start_year, 1, 1)
    end   = datetime(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

def fmt(dt):  return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
def fmtd(dt): return dt.strftime("%Y-%m-%d")

def jitter(lat, lng, km=0.05):
    return round(lat + random.uniform(-km, km), 6), round(lng + random.uniform(-km, km), 6)

def gen_users(n=100):
    users, used = [], set()
    roles = ["Farmer"]*70 + ["Veterinarian"]*15 + ["Government Officer"]*10 + ["Admin"]*5
    random.shuffle(roles)
    for i in range(n):
        fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
        email = f"{fn.lower()}.{ln.lower()}{i}@biosecure.in"
        while email in used:
            email = f"{fn.lower()}.{ln.lower()}{i}{random.randint(1,99)}@biosecure.in"
        used.add(email)
        s, d, _, _ = random.choice(ALL_LOCATIONS)
        users.append({
            "userId":   f"USR-{1000+i}",
            "fullName": f"{fn} {ln}",
            "email":    email,
            "mobile":   f"+91 {random.randint(6,9)}{random.randint(100000000,999999999)}",
            "role":     roles[i],
            "district": d,
            "state":    s,
            "createdAt":fmt(rand_date()),
        })
    return users

def gen_farms(users, n=100):
    farmers = [u for u in users if u["role"] == "Farmer"]
    farms, used = [], set()
    # First pass: give every farmer at least one farm
    for idx, owner in enumerate(farmers):
        ftype = random.choice(["Pig","Poultry"])
        pool  = FARM_NAMES_PIG if ftype == "Pig" else FARM_NAMES_POULTRY
        name  = random.choice(pool)
        while name in used:
            name = f"{random.choice(pool)} {idx+1}"
        used.add(name)
        # Use farmer's own district/state for their farm
        s = owner["state"]
        district_list = STATE_DISTRICTS[s]
        d_entry = next((x for x in district_list if x[0] == owner["district"]), district_list[0])
        d, lat, lng = d_entry
        jlat, jlng = jitter(lat, lng)
        farms.append({
            "farmId":          f"FARM-{2000+idx}",
            "farmName":        name,
            "ownerName":       owner["fullName"],
            "ownerId":         owner["userId"],
            "farmType":        ftype,
            "district":        d,
            "state":           s,
            "latitude":        jlat,
            "longitude":       jlng,
            "animalCount":     random.randint(50, 5000),
            "establishedYear": random.randint(2010, 2023),
        })
    # Second pass: fill remaining slots with random owners
    for i in range(len(farmers), n):
        ftype = random.choice(["Pig","Poultry"])
        pool  = FARM_NAMES_PIG if ftype == "Pig" else FARM_NAMES_POULTRY
        name  = random.choice(pool)
        while name in used:
            name = f"{random.choice(pool)} {i+1}"
        used.add(name)
        owner = random.choice(farmers)
        s, d, lat, lng = random.choice(ALL_LOCATIONS)
        jlat, jlng = jitter(lat, lng)
        farms.append({
            "farmId":          f"FARM-{2000+i}",
            "farmName":        name,
            "ownerName":       owner["fullName"],
            "ownerId":         owner["userId"],
            "farmType":        ftype,
            "district":        d,
            "state":           s,
            "latitude":        jlat,
            "longitude":       jlng,
            "animalCount":     random.randint(50, 5000),
            "establishedYear": random.randint(2010, 2023),
        })
    return farms

def gen_livestock(farms, n=1000):
    records = []
    for i in range(n):
        farm  = random.choice(farms)
        ftype = farm["farmType"]
        atype = "Pig" if ftype == "Pig" else random.choice(["Broiler","Layer","Breeder"])
        breed = random.choice(PIG_BREEDS if ftype == "Pig" else POULTRY_BREEDS)
        records.append({
            "livestockId":  f"LV-{3000+i}",
            "farmId":       farm["farmId"],
            "animalType":   atype,
            "breed":        breed,
            "age":          f"{random.randint(1,36)} months",
            "quantity":     random.randint(5, 500),
            "healthStatus": random.choices(["Healthy","At Risk","Sick"], weights=[75,18,7])[0],
        })
    return records

def gen_vaccinations(farms, n=500):
    records = []
    for i in range(n):
        farm  = random.choice(farms)
        vname = random.choice(VACCINE_PIG if farm["farmType"] == "Pig" else VACCINE_POULTRY)
        vdate = rand_date()
        ndate = vdate + timedelta(days=random.choice([90,180,365]))
        records.append({
            "vaccinationId":   f"VAC-{4000+i}",
            "farmId":          farm["farmId"],
            "vaccineName":     vname,
            "vaccinationDate": fmtd(vdate),
            "nextDueDate":     fmtd(ndate),
            "status":          random.choices(["Completed","Scheduled","Pending"], weights=[55,30,15])[0],
        })
    return records

def gen_diseases(n=200):
    records = []
    for i in range(n):
        s, d, _, _ = random.choice(ALL_LOCATIONS)
        records.append({
            "outbreakId":      f"OUT-{5000+i}",
            "diseaseName":     random.choice(DISEASES),
            "district":        d,
            "state":           s,
            "outbreakDate":    fmtd(rand_date()),
            "affectedAnimals": random.randint(10, 2000),
            "severity":        random.choices(["Low","Moderate","High"], weights=[30,40,30])[0],
        })
    return records

def gen_biosecurity(farms, n=100):
    records = []
    for i in range(n):
        farm = farms[i % len(farms)]
        keys = ["hygieneScore","waterQualityScore","feedManagementScore",
                "visitorControlScore","wasteManagementScore","vaccinationComplianceScore"]
        scores = {k: random.randint(5, 20) for k in keys}
        total  = round(sum(scores.values()) / 120 * 100)
        risk   = "High" if total <= 50 else ("Moderate" if total <= 80 else "Low")
        records.append({
            "assessmentId":          f"BIO-{6000+i}",
            "farmId":                farm["farmId"],
            **scores,
            "totalBiosecurityScore": total,
            "riskLevel":             risk,
            "assessmentDate":        fmtd(rand_date()),
        })
    return records

def gen_vet_reports(farms, n=100):
    records = []
    for i in range(n):
        farm = random.choice(farms)
        records.append({
            "reportId":         f"RPT-{7000+i}",
            "veterinarianName": random.choice(VET_NAMES),
            "farmId":           farm["farmId"],
            "inspectionDate":   fmtd(rand_date()),
            "observations":     random.choice(OBSERVATIONS),
            "recommendations":  random.choice(RECOMMENDATIONS),
        })
    return records

def gen_alerts(n=50):
    records = []
    for i in range(n):
        s, d, _, _ = random.choice(ALL_LOCATIONS)
        records.append({
            "alertId":      f"ALT-{8000+i}",
            "title":        random.choice(ALERT_TITLES),
            "district":     d,
            "state":        s,
            "alertMessage": random.choice(ALERT_MESSAGES),
            "issuedDate":   fmtd(rand_date()),
        })
    return records

def gen_gis(farms, n=100):
    records = []
    for i in range(n):
        farm = farms[i % len(farms)]
        jlat, jlng = jitter(farm["latitude"], farm["longitude"], 0.02)
        records.append({
            "locationId":    f"GIS-{9000+i}",
            "farmId":        farm["farmId"],
            "latitude":      jlat,
            "longitude":     jlng,
            "hotspotStatus": random.choices(["Active","Inactive","Monitoring"], weights=[20,60,20])[0],
        })
    return records

def gen_notifications(users, n=200):
    records = []
    for i in range(n):
        user = random.choice(users)
        records.append({
            "notificationId": f"NOT-{10000+i}",
            "userId":         user["userId"],
            "title":          random.choice(NOTIF_TITLES),
            "message":        random.choice(NOTIF_MESSAGES),
            "sentAt":         fmt(rand_date()),
            "isRead":         random.choice([True, False]),
        })
    return records

def gen_analytics(diseases_data, farms_data, vaccinations_data, biosecurity_data):
    dist_disease = {}
    for d in diseases_data:
        dist_disease[d["district"]] = dist_disease.get(d["district"], 0) + 1
    state_farm = {}
    for f in farms_data:
        state_farm[f["state"]] = state_farm.get(f["state"], 0) + 1
    monthly_vac = {}
    for v in vaccinations_data:
        m = v["vaccinationDate"][:7]
        monthly_vac[m] = monthly_vac.get(m, 0) + 1
    score_dist = {"0-50": 0, "51-80": 0, "81-100": 0}
    for b in biosecurity_data:
        s = b["totalBiosecurityScore"]
        if s <= 50:   score_dist["0-50"] += 1
        elif s <= 80: score_dist["51-80"] += 1
        else:         score_dist["81-100"] += 1
    risk_stats = {"High": 0, "Moderate": 0, "Low": 0}
    for b in biosecurity_data:
        risk_stats[b["riskLevel"]] += 1
    return {
        "districtWiseDiseaseCount":     [{"district": k, "count": v} for k, v in sorted(dist_disease.items(), key=lambda x: -x[1])],
        "stateWiseFarmCount":           [{"state": k, "count": v} for k, v in sorted(state_farm.items(), key=lambda x: -x[1])],
        "monthlyVaccinationTrends":     [{"month": k, "count": v} for k, v in sorted(monthly_vac.items())],
        "biosecurityScoreDistribution": [{"range": k, "count": v} for k, v in score_dist.items()],
        "riskClassificationStats":      [{"riskLevel": k, "count": v} for k, v in risk_stats.items()],
    }

def write_json(data, filename):
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"  [OK] {filename} ({len(data)} records)")

def write_csv(data, filename):
    if not data: return
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=data[0].keys())
        w.writeheader()
        w.writerows(data)
    print(f"  [OK] {filename}")

if __name__ == "__main__":
    print("\nBioSecure Farm - Generating Synthetic Dataset...\n")

    users         = gen_users(100)
    farms         = gen_farms(users, 100)
    livestock     = gen_livestock(farms, 1000)
    vaccinations  = gen_vaccinations(farms, 500)
    diseases      = gen_diseases(200)
    biosecurity   = gen_biosecurity(farms, 100)
    vet_reports   = gen_vet_reports(farms, 100)
    alerts        = gen_alerts(50)
    gis           = gen_gis(farms, 100)
    notifications = gen_notifications(users, 200)
    analytics     = gen_analytics(diseases, farms, vaccinations, biosecurity)

    print("Writing JSON files...")
    write_json(users,         "users.json")
    write_json(farms,         "farms.json")
    write_json(livestock,     "livestock.json")
    write_json(vaccinations,  "vaccinations.json")
    write_json(diseases,      "diseases.json")
    write_json(biosecurity,   "biosecurity.json")
    write_json(vet_reports,   "veterinarian_reports.json")
    write_json(alerts,        "government_alerts.json")
    write_json(gis,           "gis_locations.json")
    write_json(notifications, "notifications.json")
    write_json([analytics],   "analytics.json")

    print("\nWriting CSV files...")
    write_csv(users,         "users.csv")
    write_csv(farms,         "farms.csv")
    write_csv(livestock,     "livestock.csv")
    write_csv(vaccinations,  "vaccinations.csv")
    write_csv(diseases,      "diseases.csv")
    write_csv(biosecurity,   "biosecurity.csv")
    write_csv(vet_reports,   "veterinarian_reports.csv")
    write_csv(alerts,        "government_alerts.csv")
    write_csv(gis,           "gis_locations.csv")
    write_csv(notifications, "notifications.csv")

    print("\nAll files generated successfully!")
    print(f"  Users: {len(users)} | Farms: {len(farms)} | Livestock: {len(livestock)}")
    print(f"  Vaccinations: {len(vaccinations)} | Diseases: {len(diseases)} | Biosecurity: {len(biosecurity)}")
    print(f"  Vet Reports: {len(vet_reports)} | Alerts: {len(alerts)} | GIS: {len(gis)} | Notifications: {len(notifications)}")
