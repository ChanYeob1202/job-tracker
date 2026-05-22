/* 
Handles storing, reading, and clearing the JWT token in localStorage
*/


export function setToken(token: string){
  localStorage.setItem("token", token);
}

export function getToken() : string | null{
  return localStorage.getItem("token");
}


export function clearToekn(){
  localStorage.removeItem("token");
}