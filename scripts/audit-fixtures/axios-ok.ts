import axios from 'axios'
export async function okAxios() {
  return axios.get('https://xyz.supabase.co/rest/v1/ok')
}
