import {Outlet} from 'react-router';

import cls from './Layout.module.scss';

export const Layout = () => {
    return (
        <div className={cls.layoutWrapper}>
            <Outlet/>
        </div>
    );
};