import "./App.css";

const features = [
  "CSV uploads with validation",
  "Column sorting and filtering",
  "Lazy rendering for large datasets",
  "GitHub Pages-ready deployments",
];

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Interactive Table</p>
        <h1>Data at a glance, pipes that keep it honest.</h1>
        <p>
          We are scaffolding a responsive table that honors CSV uploads, surface-level filtering, and
          virtualization for large datasets. Everything is wired for predictable state and quick
          deployments.
        </p>
      </section>

      <section className="feature-list">
        <h2>Built for the plan</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
