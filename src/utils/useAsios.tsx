import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import Cookies from "js-cookie";

export const baseURL = "https://api.domilix.com";

const useAxios = () => {
  const { authData, setUser, setAuthData } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: { Authorization: `Bearer ${authData?.authorisation.token}` },
  });

  if (authData)
    axiosInstance.interceptors.request.use(async (req) => {
      const user = jwtDecode(authData.authorisation.token);
      const isExpired = dayjs.unix(user.exp!).diff(dayjs()) < 1;

      if (!isExpired) return req;

      const response = await axios.post(`refresh/`);

      Cookies.set("authorization", response.data);

      setAuthData && setAuthData(response.data);
      req.headers.Authorization = `Bearer ${response.data.access_token}`;
      return req;
    });

  return axiosInstance;
};

export default useAxios;
