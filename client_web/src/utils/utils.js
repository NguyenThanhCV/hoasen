export function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];

    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return "";
}

export function setCookie(cname, cvalue, exdays = 7) {
  const d = new Date();

  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);

  const expires = "expires=" + d.toUTCString();

  document.cookie =
    cname +
    "=" +
    encodeURIComponent(cvalue) +
    ";" +
    expires +
    ";path=/;SameSite=Lax";
}

export function delCookie(cname = "accessToken") {
  document.cookie =
    cname + "=;" + "expires=Thu, 01 Jan 1970 00:00:00 UTC;" + "path=/;";
}

export function clearAuthCookies() {
  delCookie("accessToken");
  delCookie("refreshToken");
  delCookie("user");
}
