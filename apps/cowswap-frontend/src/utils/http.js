import axios from 'axios';
const baseURL="https://5000-chameleonex-chameleonsw-us8pxsl4p3j.ws-eu118.gitpod.io/api/user"

const http=axios.create({
    baseURL
})
console.log(baseURL)
export default http