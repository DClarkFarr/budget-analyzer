import axios from "axios";

const webApi = axios.create({
    baseURL: "/api/",
});
export default webApi;
