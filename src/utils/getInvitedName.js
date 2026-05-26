export function getInvitedName() {
  if (typeof window === "undefined") {
    return "Invitado prueba";
  }

  const value = new URLSearchParams(window.location.search).get("invitado");
  return value && value.trim() ? value.trim() : "Invitado prueba";
}
