import {useLocation, useNavigate} from "react-router-dom";

interface StepLocationState {
  /** Шаг, с которого пришли кнопкой визарда — значит, он лежит в истории прямо перед текущим */
  from?: string;
}

/** Переход на следующий шаг: запоминаем, откуда пришли, чтобы «назад» мог вернуться по истории. */
export function useStepForward() {
  const navigate = useNavigate();
  const {pathname} = useLocation();

  return (to: string) => {
    navigate(to, {state: {from: pathname} satisfies StepLocationState});
  };
}

/**
 * «Назад» на шаг backTo. Если пришли с него кнопкой визарда — history.back() (сохраняется
 * прокрутка и нет лишних записей). Иначе (открыли по ссылке, после редиректа, браузерными
 * стрелками) предыдущая запись может быть чем угодно — заменяем текущую на backTo.
 */
export function useStepBack() {
  const navigate = useNavigate();
  const location = useLocation();

  return (backTo: string) => {
    const state = location.state as StepLocationState | null;

    if (state?.from === backTo) {
      navigate(-1);
    } else {
      navigate(backTo, {replace: true});
    }
  };
}
