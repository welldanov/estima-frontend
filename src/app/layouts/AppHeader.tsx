import type {MouseEvent} from "react";
import {Link, useLocation} from "react-router-dom";

import {useStepBack, useValuationStore} from "@src/features/valuation";
import {cn} from "@src/shared/lib";
import {BackButton} from "@src/shared/ui";
import {EstimaLogo} from "@src/shared/assets/icons";

import styles from "./AppHeader.module.scss";

// Куда ведёт «назад» с каждого шага. Нет записи — кнопка скрыта (главная).
const BACK_ROUTES: Record<string, string> = {
  "/predict/address": "/",
  "/predict/details": "/predict/address",
  "/predict/result": "/predict/details",
};

// Живёт в Layout вне обёртки с key={pathname} — не перемонтируется и не мигает при переходах.
export function AppHeader() {
  const {pathname} = useLocation();
  const stepBack = useStepBack();

  const reset = useValuationStore((s) => s.reset);

  const backTo = BACK_ROUTES[pathname];

  const handleBack = () => {
    if (backTo) stepBack(backTo);
  };

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Ctrl/Cmd/Shift-клик открывает главную в новой вкладке — текущую не трогаем.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    reset();
  };

  return (
    <header className={styles.header}>
      <div className={cn(styles.back, !backTo && styles.hidden)} inert={!backTo}>
        <BackButton onClick={handleBack}/>
      </div>

      {/* Логотип = «начать заново»: на главную со сбросом всех вводных (replace — как «Оценить другой объект») */}
      <Link to="/" replace className={styles.logoLink} aria-label="estima — на главную" onClick={handleLogoClick}>
        <EstimaLogo className={styles.logo} aria-hidden/>
      </Link>
    </header>
  );
}
