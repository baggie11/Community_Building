'use client';

import { useActionState } from 'react';
import { unlockModeration } from '@/app/actions';

const INITIAL = { ok: false, message: '' };

// Passcode gate for the admin backend. On success the server sets a session
// cookie and re-renders /moderate with the pending queue.
export default function ModerationGate() {
  const [state, formAction, pending] = useActionState(unlockModeration, INITIAL);

  return (
    <div className="mod-gate">
      <form action={formAction}>
        <div className="field">
          <label htmlFor="modPass">Moderator passcode</label>
          <input
            type="password"
            id="modPass"
            name="passcode"
            autoComplete="off"
            aria-describedby="modGateMsg"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Checking…' : 'Unlock panel'}
        </button>
      </form>

      <p className={state.ok ? 'form-status is-success' : 'field-error'} id="modGateMsg" role="alert">
        {state.message}
      </p>
    </div>
  );
}
