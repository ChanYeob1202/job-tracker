/* 
  token storage helper - abstract over localstorage
  so the rest app never touches storage APIs directly

  token 을 localstorage 에 저장/조회/삭제하는 helper.
  다른파일은 localStorage를 직접 만지지 말고 이 함수들을 통해접근
*/

export function setToken(token: string) {
  return localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return  localStorage.getItem("token");
}

export function clearToken() {
  return localStorage.removeItem("token");
}
