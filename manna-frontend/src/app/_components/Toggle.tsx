import styles from "./toggle.module.css";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

export default function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <label className={styles.toggleSwitch}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.slider}></span>
    </label>
  );
}
