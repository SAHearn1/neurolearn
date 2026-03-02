export function SettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={(event) => event.preventDefault()}>
        <label className="block text-sm font-medium text-slate-700">
          Preferred text size
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" defaultValue="medium">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input className="h-4 w-4" defaultChecked type="checkbox" />
          Reduce motion
        </label>

        <button className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white" type="submit">
          Save preferences
        </button>
      </form>
    </main>
  )
}
