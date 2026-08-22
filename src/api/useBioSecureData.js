/**
 * useBioSecureData – fetches all BioSecure collections from MongoDB API
 * and provides role-filtered data to the app.
 */
import { useState, useEffect, useCallback } from "react";
import {
  loginUser,
  getFarms, getFarmsByOwner, getFarmsByDistrict,
  getLivestock, getLivestockByFarm,
  getVaccinations, getVaccinationsByFarm,
  getDiseases, getDiseasesByDistrict,
  getBiosecurity, getBiosecurityByFarm,
  getVetReports, getVetReportsByFarm,
  getAlerts, getAlertsByDistrict,
  getGISLocations,
  getNotifications, getNotificationsByUser,
  getAnalyticsSummary,
  getUsers,
} from "./mongoService";

export function useBioSecureData(role, authenticatedUser = null) {
  const [user,          setUser]          = useState(null);
  const [farms,         setFarms]         = useState([]);
  const [livestock,     setLivestock]     = useState([]);
  const [vaccinations,  setVaccinations]  = useState([]);
  const [diseases,      setDiseases]      = useState([]);
  const [biosecurity,   setBiosecurity]   = useState([]);
  const [vetReports,    setVetReports]    = useState([]);
  const [alerts,        setAlerts]        = useState([]);
  const [gisLocations,  setGisLocations]  = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [allUsers,      setAllUsers]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const safe = (p) => p.catch(() => []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loggedUser = authenticatedUser || await loginUser(role);
      if (!loggedUser) throw new Error("No user found for role: " + role);
      setUser(loggedUser);

      const { userId, district } = loggedUser;

      if (role === "Farmer") {
        // Load farms for this owner; fallback to district farms
        let myFarms = await safe(getFarmsByOwner(userId));
        if (!myFarms || myFarms.length === 0) {
          myFarms = await safe(getFarmsByDistrict(district));
        }
        setFarms(myFarms);

        const [diseasesData, alertsData, gisData, notifsData, analyticsData] =
          await Promise.all([
            safe(getDiseasesByDistrict(district)),
            safe(getAlertsByDistrict(district)),
            safe(getGISLocations()),
            safe(getNotificationsByUser(userId)),
            getAnalyticsSummary().catch(() => null),
          ]);
        setDiseases(diseasesData);
        setAlerts(alertsData);
        setGisLocations(gisData);
        setNotifications(notifsData);
        setAnalytics(analyticsData);

        // Load farm-specific data for first farm
        if (myFarms.length > 0) {
          const farmId = myFarms[0].farmId;
          const [lvData, vacData, bioData, vetData] = await Promise.all([
            safe(getLivestockByFarm(farmId)),
            safe(getVaccinationsByFarm(farmId)),
            safe(getBiosecurityByFarm(farmId)),
            safe(getVetReportsByFarm(farmId)),
          ]);
          setLivestock(lvData);
          setVaccinations(vacData);
          setBiosecurity(bioData);
          setVetReports(vetData);
        }

      } else if (role === "Veterinarian") {
        const [farmsData, diseasesData, alertsData, gisData, notifsData,
               vetData, vacData, lvData] = await Promise.all([
          safe(getFarms()),
          safe(getDiseases()),
          safe(getAlerts()),
          safe(getGISLocations()),
          safe(getNotificationsByUser(userId)),
          safe(getVetReports()),
          safe(getVaccinations()),
          safe(getLivestock()),
        ]);
        setFarms(farmsData);
        setDiseases(diseasesData);
        setAlerts(alertsData);
        setGisLocations(gisData);
        setNotifications(notifsData);
        setVetReports(vetData);
        setVaccinations(vacData);
        setLivestock(lvData);

      } else {
        // Government Officer / Admin — load everything
        const [farmsData, diseasesData, alertsData, gisData, notifsData,
               analyticsData, usersData, bioData, vacData, vetData, lvData] =
          await Promise.all([
            safe(getFarms()),
            safe(getDiseases()),
            safe(getAlerts()),
            safe(getGISLocations()),
            safe(getNotificationsByUser(userId)),
            getAnalyticsSummary().catch(() => null),
            safe(getUsers()),
            safe(getBiosecurity()),
            safe(getVaccinations()),
            safe(getVetReports()),
            safe(getLivestock()),
          ]);
        setFarms(farmsData);
        setDiseases(diseasesData);
        setAlerts(alertsData);
        setGisLocations(gisData);
        setNotifications(notifsData);
        setAnalytics(analyticsData);
        setAllUsers(usersData);
        setBiosecurity(bioData);
        setVaccinations(vacData);
        setVetReports(vetData);
        setLivestock(lvData);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role, authenticatedUser]);

  useEffect(() => { load(); }, [load]);

  return {
    user, farms, livestock, vaccinations, diseases,
    biosecurity, vetReports, alerts, gisLocations,
    notifications, analytics, allUsers,
    loading, error, reload: load,
  };
}
