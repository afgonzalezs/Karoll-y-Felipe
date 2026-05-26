import AnimatedSection from "../AnimatedSection";

export default function RsvpSection({ invitedName }) {
  return (
    <AnimatedSection id="rsvp" className="container">
      <h2>Confirma tu asistencia</h2>
      <p>Ayudanos confirmando antes del 05.09.2026.</p>
      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
        <label>
          Nombre
          <input type="text" defaultValue={invitedName} />
        </label>
        <label>
          ¿Asiste?
          <select defaultValue="si">
            <option value="si">Si</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Numero de acompanantes
          <input type="number" min="0" max="5" defaultValue="0" />
        </label>
        <label className="full">
          Restricciones alimentarias
          <input type="text" placeholder="Alergias, vegetariano, etc." />
        </label>
        <button type="submit" className="btn">
          Enviar RSVP
        </button>
      </form>
    </AnimatedSection>
  );
}
