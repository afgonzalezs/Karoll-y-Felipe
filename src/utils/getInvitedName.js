import { guests } from "../config/guests";

export function getToken() {
  if (typeof window === "undefined") return "prueba";
  return new URLSearchParams(window.location.search).get("t")
    || new URLSearchParams(window.location.search).get("invitado")
    || "prueba";
}

export function getGuest(token) {
  const entry = guests[token];
  if (!entry) return { nombre: "Invitado prueba", virtual: false, country: null };
  if (typeof entry === "string") return { nombre: entry, virtual: false, country: null };
  return { virtual: false, country: null, ...entry };
}

export function getInvitedName() {
  if (typeof window === "undefined") return "Invitado prueba";
  return getGuest(getToken()).nombre;
}
