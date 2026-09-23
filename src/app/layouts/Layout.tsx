import {useLayoutEffect} from 'react';
import {Outlet, useLocation, useNavigationType} from 'react-router';

import {AppHeader} from './AppHeader';

import cls from './Layout.module.scss';

export const Layout = () => {
    const {pathname} = useLocation();
    const navigationType = useNavigationType();

    // Новый шаг открываем с начала. POP (назад/вперёд браузера) не трогаем — прокрутку восстанавливает браузер.
    useLayoutEffect(() => {
        if (navigationType !== 'POP') {
            // instant: глобальный scroll-behavior: smooth иначе анимирует прокрутку под переходом
            window.scrollTo({top: 0, behavior: 'instant'});
        }
    }, [pathname, navigationType]);

    return (
        <div className={cls.layoutWrapper}>
            <AppHeader/>

            {/* key → при смене роута обёртка пересоздаётся и заново проигрывает появление */}
            <div key={pathname} className={cls.page}>
                <Outlet/>
            </div>
        </div>
    );
};
