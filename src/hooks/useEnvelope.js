import { useEffect, useMemo, useState } from "react";

export function useEnvelope() {
  const [isUntying, setIsUntying] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [hideEnvelope, setHideEnvelope] = useState(false);
  const [isAnimatingOpen, setIsAnimatingOpen] = useState(false);

  useEffect(() => {
    if (!isOpened) {
      document.body.classList.add("pre-open");
      return () => document.body.classList.remove("pre-open");
    }

    document.body.classList.remove("pre-open");
    return undefined;
  }, [isOpened]);

  const envelopeScreenClass = useMemo(() => {
    return `envelope-screen${isOpened ? " is-exiting" : ""}`;
  }, [isOpened]);

  const invitationClass = useMemo(() => {
    return `invitation-content${isOpened ? " visible" : ""}`;
  }, [isOpened]);

  function openInvitation() {
    if (isAnimatingOpen || isOpened) {
      return;
    }

    setIsAnimatingOpen(true);
    setIsUntying(true);

    window.setTimeout(() => {
      setIsOpened(true);
      setIsUntying(false);
    }, 650);

    window.setTimeout(() => {
      setHideEnvelope(true);
      setIsAnimatingOpen(false);
    }, 1480);
  }

  return {
    isUntying,
    isOpened,
    hideEnvelope,
    isAnimatingOpen,
    envelopeScreenClass,
    invitationClass,
    openInvitation
  };
}
