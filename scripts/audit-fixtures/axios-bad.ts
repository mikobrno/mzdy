import axios from 'axios'
export async function badAxios() {
  return axios.get('https://api.example.com/x')
}
