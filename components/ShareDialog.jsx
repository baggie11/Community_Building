'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { submitStory } from '@/app/actions';
import { MAX_LEN, MIN_LEN } from '@/lib/constants';

const INITIAL = { ok: false, message: '', errors: {} };

export default function ShareDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const wasOkRef = useRef(false);

  const [count, setCount] = useState(0);
  const [state, formAction, pending] = useActionState(submitStory, INITIAL);

  // Open / close the native <dialog> (it brings focus trapping and Escape
  // handling for free).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Keep parent state in sync when the dialog closes (Escape, backdrop, X).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  // Reset the form fields once a story has been accepted.
  useEffect(() => {
    if (state.ok && !wasOkRef.current) {
      formRef.current?.reset();
      setCount(0);
    }
    wasOkRef.current = Boolean(state.ok);
  }, [state]);

  const errors = state.errors || {};
  const statusClass =
    'form-status' + (state.ok ? ' is-success' : state.message ? ' is-error' : '');

  const counterClass =
    'counter' + (count === 0 || count >= MIN_LEN ? (count >= MIN_LEN ? ' is-ok' : '') : ' is-low');

  const counterHint =
    count === 0
      ? `Minimum ${MIN_LEN} characters`
      : count < MIN_LEN
        ? `${MIN_LEN - count} more to go`
        : 'Looks good';

  return (
    <dialog
      className="share-dialog"
      id="shareDialog"
      aria-labelledby="shareTitle"
      ref={dialogRef}
      onClick={(event) => {
        // Click on the backdrop closes the dialog.
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <form ref={formRef} action={formAction} id="shareForm" noValidate>
        <div className="dialog-head">
          <h2 id="shareTitle">Share Your Story</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close the share form"
            onClick={() => dialogRef.current?.close()}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className={statusClass} role="status" aria-live="polite">
          {state.message}
        </p>

        <div className="field">
          <label htmlFor="storyText">
            Your story <span className="req">required</span>
          </label>
          <textarea
            id="storyText"
            name="text"
            rows={5}
            required
            maxLength={MAX_LEN}
            placeholder="A short moment when someone helped you, or you helped someone else."
            aria-describedby="counter storyError"
            aria-invalid={errors.text ? 'true' : undefined}
            onChange={(event) => setCount(event.target.value.length)}
          />
          <div className="counter-row">
            <span className={counterClass} id="counter">
              {count} / {MAX_LEN} characters
            </span>
            <span className="counter-hint">{counterHint}</span>
          </div>
          {errors.text ? (
            <p className="field-error" id="storyError" role="alert">
              {errors.text}
            </p>
          ) : (
            <p className="field-error" id="storyError" role="alert" hidden></p>
          )}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            required
            aria-describedby="catError"
            aria-invalid={errors.category ? 'true' : undefined}
            defaultValue=""
          >
            <option value="">Choose a category…</option>
            <option value="Received Help">Received Help</option>
            <option value="Gave Help">Gave Help</option>
            <option value="Community">Community</option>
          </select>
          {errors.category ? (
            <p className="field-error" id="catError" role="alert">
              {errors.category}
            </p>
          ) : (
            <p className="field-error" id="catError" role="alert" hidden></p>
          )}
        </div>

        <div className="field">
          <label htmlFor="firstName">
            First name <span className="hint">(optional — leave blank to post as Anonymous)</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            maxLength={30}
            autoComplete="given-name"
            placeholder="Anonymous"
            aria-describedby="nameError"
            aria-invalid={errors.firstName ? 'true' : undefined}
          />
          {errors.firstName ? (
            <p className="field-error" id="nameError" role="alert">
              {errors.firstName}
            </p>
          ) : (
            <p className="field-error" id="nameError" role="alert" hidden></p>
          )}
        </div>

        <div className="field check-field">
          <input
            type="checkbox"
            id="confirm"
            name="confirm"
            required
            aria-describedby="confirmError"
            aria-invalid={errors.confirm ? 'true' : undefined}
          />
          <label htmlFor="confirm">
            I confirm this story is true to the best of my knowledge and contains no personal
            details like phone numbers, addresses, or IDs.
          </label>
          {errors.confirm ? (
            <p className="field-error" id="confirmError" role="alert">
              {errors.confirm}
            </p>
          ) : (
            <p className="field-error" id="confirmError" role="alert" hidden></p>
          )}
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Sending…' : 'Submit for review'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
