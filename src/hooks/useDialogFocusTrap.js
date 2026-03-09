import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getFocusableElements = (container) => {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element instanceof HTMLElement &&
      !element.hasAttribute('disabled') &&
      (element.offsetParent !== null || element === document.activeElement)
  );
};

export const useDialogFocusTrap = (isOpen, initialFocusRef) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    wasOpenRef.current = true;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const timeoutId = window.setTimeout(() => {
      const initialFocus = initialFocusRef?.current;
      const fallbackFocus = getFocusableElements(containerRef.current)[0];
      (initialFocus || fallbackFocus)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialFocusRef, isOpen]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) {
      return undefined;
    }

    const container = containerRef.current;

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || !wasOpenRef.current) {
      return;
    }

    previousFocusRef.current?.focus();
    wasOpenRef.current = false;
  }, [isOpen]);

  return containerRef;
};
