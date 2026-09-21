import {Navigate, Route, Routes} from "react-router-dom";

import {Layout} from "../layouts";

import {HomePage} from "../../pages/home";
import {AddressPage} from "../../pages/address";
import {ApartmentDetailsPage} from "../../pages/details";
import {CalculatingPage} from "../../pages/calculating";
import {ResultPage} from "../../pages/result";


export function AppRouter() {
    return (
        <Routes>
            <Route path={''} element={<Layout/>}>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/predict/address" element={<AddressPage/>}/>
                <Route path="/predict/details" element={<ApartmentDetailsPage/>}/>
                <Route path="/predict/calculating" element={<CalculatingPage/>}/>
                <Route path="/predict/result" element={<ResultPage/>}/>

                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Route>
        </Routes>
    );
}