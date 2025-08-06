import { Routes, Route } from "react-router-dom";
import {
  containsPermission,
  getAllPossiblePermissions,
  getMenuObjectListByPermissions,
} from "../utilities/linksAndPermissions.utilities";
import Welcome from "../pages/Welcome";

const AppRoutes = () => {
  const userPermissions = getAllPossiblePermissions();
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      {getMenuObjectListByPermissions(userPermissions)
        .flatMap((menu) => menu.linkObjList)
        .map((linkObj) => (
          <Route
            key={linkObj.link}
            path={linkObj.link}
            element={
              linkObj.permission !== null &&
              !containsPermission(linkObj.permission, userPermissions) ? (
                <Welcome />
              ) : (
                linkObj.component
              )
            }
          />
        ))}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {/* <Route path="/other" element={<OtherPage />} /> */}
      {/* Add more routes as needed */}
      <Route path="*" element={<Welcome />} />
    </Routes>
  );
};

export default AppRoutes;
