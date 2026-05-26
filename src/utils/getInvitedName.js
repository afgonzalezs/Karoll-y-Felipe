import { guests } from "../config/guests";

export function getInvitedName() {
  if (typeof window === "undefined") return "Invitado prueba";
  const params = new URLSearchParams(window.location.search);
  const token = params.get("t") || params.get("invitado");
  if (!token) return "Invitado prueba";
  return guests[token] || token;
}

export function getToken() {
  if (typeof window === "undefined") return "prueba";
  return new URLSearchParams(window.location.search).get("t")
    || new URLSearchParams(window.location.search).get("invitado")
    || "prueba";
}
