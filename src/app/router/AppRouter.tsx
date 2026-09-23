import {Navigate, Route, Routes} from "react-router-dom";

import {Layout} from "@src/app/layouts";

import {HomePage} from "@src/pages/home";
import {AddressPage} from "@src/pages/address";
import {ApartmentDetailsPage} from "@src/pages/details";
import {ResultPage} from "@src/pages/result";


export function AppRouter() {
    return (
        <Routes>
            <Route path={''} element={<Layout/>}>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/predict/address" element={<AddressPage/>}/>
                <Route path="/predict/details" element={<ApartmentDetailsPage/>}/>
                <Route path="/predict/result" element={<ResultPage/>}/>

                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Route>
        </Routes>
    );
}