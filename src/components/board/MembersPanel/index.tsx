import { useState } from "react";
import { ROLE_LABELS, type MemberRole, type ProjectMember } from "@domain/projectMember";
import { addProjectMemberByEmail } from "@services/addProjectMemberByEmail";
import { updateProjectMemberRole } from "@services/updateProjectMemberRole";
import { removeProjectMember } from "@services/removeProjectMember";
import { useHeaders } from "@hooks/useHeaders";

interface MembersPanelProps {
  open:          boolean;
  projectId:     string | undefined;
  members:       ProjectMember[];
  loading:       boolean;
  error:         string | null;
  currentUserId: string | undefined;
  onClose:       () => void;
  onChanged:     () => void;
}

// What the current user can do. The backend enforces the same rules; the UI only hides what would fail.
function permissionsFor(myRole: MemberRole | undefined) {
  const isOwner   = myRole === "Owner";
  const canManage = isOwner || myRole === "Admin";
  return {
    canManage,
    // Roles the user can give when adding someone (Owner is never given by email)
    addRoles:  (isOwner ? ["Admin", "Member", "Viewer"] : ["Member", "Viewer"]) as MemberRole[],
    // Roles the user can set on an existing member
    editRoles: (isOwner ? ["Owner", "Admin", "Member", "Viewer"] : ["Member", "Viewer"]) as MemberRole[],
    // Admins only manage members and viewers; owners manage everyone
    canEdit:   (member: ProjectMember) => isOwner || (canManage && (member.role === "Member" || member.role === "Viewer")),
  };
}

export function MembersPanel({ open, projectId, members, loading, error, currentUserId, onClose, onChanged }: MembersPanelProps) {
  const [email,     setEmail]     = useState("");
  const [role,      setRole]      = useState<MemberRole>("Member");
  const [busy,      setBusy]      = useState(false);
  const [message,   setMessage]   = useState<{ text: string; ok: boolean } | null>(null);
  const { getHeaders } = useHeaders();

  const myRole      = members.find((m) => m.userId === currentUserId)?.role;
  const permissions = permissionsFor(myRole);

  // Runs one action, shows its result and reloads the members
  const run = async (action: () => Promise<void>, okText: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ text: okText, ok: true });
      onChanged();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Algo salió mal.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !email.trim()) return;
    run(async () => {
      await addProjectMemberByEmail(projectId, email, role, getHeaders());
      setEmail("");
      setRole("Member");
    }, "Persona agregada al proyecto.");
  };

  const handleRoleChange = (member: ProjectMember, newRole: MemberRole) => {
    if (newRole === member.role) return;
    run(() => updateProjectMemberRole(member, newRole, getHeaders()), `Ahora ${member.fullName} es ${ROLE_LABELS[newRole].toLowerCase()}.`);
  };

  const handleRemove = (member: ProjectMember) => {
    if (!window.confirm(`¿Quitar a ${member.fullName} del proyecto?`)) return;
    run(() => removeProjectMember(member.projectMemberId, getHeaders()), `${member.fullName} ya no es miembro del proyecto.`);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col bg-gh-surface border-l border-gh-border shadow-2xl
                    transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border">
          <h2 className="text-sm font-semibold text-gh-text">Miembros del proyecto</h2>
          <button onClick={onClose} className="text-gh-muted hover:text-gh-text text-lg leading-none" aria-label="Cerrar">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {permissions.canManage && (
            <form onSubmit={handleAdd} className="space-y-2">
              <label className="block text-xs font-medium text-gh-muted">Agregar por correo</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="persona@correo.com"
                  className="flex-1 min-w-0 bg-gh-surface border border-gh-border rounded-md px-3 py-1.5 text-sm text-gh-text placeholder-gh-muted outline-none focus:border-gh-blue"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="bg-gh-surface border border-gh-border rounded-md px-2 py-1.5 text-sm text-gh-text outline-none focus:border-gh-blue"
                >
                  {permissions.addRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={busy || !email.trim()}
                className="w-full rounded-md bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-medium py-1.5 transition-colors"
              >
                {busy ? "Guardando…" : "Agregar"}
              </button>
              <p className="text-[11px] text-gh-muted">La persona debe tener una cuenta registrada en PullTask.</p>
            </form>
          )}

          {message && (
            <p className={`text-xs ${message.ok ? "text-green-400" : "text-red-400"}`}>{message.text}</p>
          )}

          <div>
            <p className="text-xs font-medium text-gh-muted mb-2">
              {members.length} {members.length === 1 ? "miembro" : "miembros"}
            </p>
            {loading && members.length === 0 && <p className="text-xs text-gh-muted">Cargando…</p>}
            {error && <p className="text-xs text-red-400">{error}</p>}

            <ul className="divide-y divide-gh-border">
              {members.map((member) => {
                const editable = permissions.canEdit(member);
                const isMe     = member.userId === currentUserId;
                return (
                  <li key={member.projectMemberId} className="flex items-center gap-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {member.profilePictureUrl ? (
                        <img src={member.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        member.fullName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gh-text truncate">
                        {member.fullName}{isMe && <span className="text-gh-muted"> (tú)</span>}
                      </p>
                    </div>
                    {editable ? (
                      <select
                        value={member.role}
                        disabled={busy}
                        onChange={(e) => handleRoleChange(member, e.target.value as MemberRole)}
                        className="bg-gh-surface border border-gh-border rounded-md px-2 py-1 text-xs text-gh-text outline-none focus:border-gh-blue"
                      >
                        {permissions.editRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs text-gh-muted">{ROLE_LABELS[member.role]}</span>
                    )}
                    {editable && (
                      <button
                        onClick={() => handleRemove(member)}
                        disabled={busy}
                        className="text-xs text-red-400 hover:underline disabled:opacity-50"
                      >
                        Quitar
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
