# Links personalizados de invitación

## Reglas de seguridad Firebase (actualizar antes de 30 días)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rsvp/{doc} {
      allow read: if false;
      allow write: if true;
    }
    match /{col}/{doc} {
      allow read, write: if col.matches("reactions_.*") || col.matches("comments_.*");
    }
  }
}
```
Base: `https://afgonzalezs.github.io/Karoll-y-Felipe/`

1. Carlos Eduardo, Gladys, Carlos Santiago
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Carlos%20Eduardo%2C%20Gladys%2C%20Carlos%20Santiago`

2. Mami, Papi y alexito
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Mami%2C%20Papi%20y%20alexito`

3. Gina y Esteban
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Gina%20y%20Esteban`

4. Ruth
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Ruth`

5. Edgar
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Edgar`

6. Marylu y Elena
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Marylu%20y%20Elena`

7. Andres y Aleja
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Andres%20y%20Aleja`

8. Miguelito
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Miguelito`

9. Fabi
   `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Fabi`

10. Gonzo y Mel
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Gonzo%20y%20Mel`

11. Gabo y Nata
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Gabo%20y%20Nata`

12. Migue
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Migue`

13. La gemelis
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=La%20gemelis`

14. Lucía, Manuel
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Luc%C3%ADa%2C%20Manuel`

15. Majo y Sammy
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Majo%20y%20Sammy`

16. Oscar Diaz
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Oscar%20Diaz`

17. Jessica y Wilber
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Jessica%20y%20Wilber`

18. Ernesto
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Ernesto`

19. Juan
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Juan`

20. Tía Mary y Tío Guillermo
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=T%C3%ADa%20Mary%20y%20T%C3%ADo%20Guillermo`

21. Edwin Martinez
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Edwin%20Martinez`

22. Andres Olaya
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Andres%20Olaya`

23. Adiela Rodriguez
    `https://afgonzalezs.github.io/Karoll-y-Felipe/?invitado=Adiela%20Rodriguez`
