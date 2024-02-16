import TimesLogo from "@/assets/dtutimesIcon";
import { CurrUserCtx } from "@/contexts/current_user";
import API from "@/services/API";
import { getTokenFromStorage, getUserFromJSON, getUserFromStorage } from "@/services/localStorageParser";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const { setGrantedPermissions, setUser, ready } = React.useContext(CurrUserCtx);

  useEffect(() => {
    // todo: for some reasons search params standard way doesn't work so have to do manual string search; fix it
    const forced_logout = window?.location?.href?.includes("forcedLogout=true");
    if (forced_logout) {
      API.post("/auth/logout").then(() => {
        toast.info("You have been logged out!");
      }).catch(() => {
        toast.error("Server rejected your logout!");
      }).finally(() => localStorage.clear());
    } else if (ready) {
      const session_expired = window?.location?.href?.includes("sessionExpired=true");
      if (session_expired) {
        localStorage.clear();
        toast.error("Session expired, please login again!");
      } else if (getTokenFromStorage()) {
        const val = getUserFromStorage();
        if (!val) {
          toast.error("Session expired, please login again!");
          localStorage.clear();
        } else {
          API.get("/user/current-user").then((res) => {

            const { user, permissions } = getUserFromJSON(res.data.data);
            setGrantedPermissions(permissions);
            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard");
          }).catch((e) => {
            localStorage.clear();
            toast.error(e.response?.data?.message || e.message);
          });
        }
      }
    }
  }, [ready]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    await API.post("/auth/login", { email, password }).then((res) => {
      const data = res.data;
      if (data.status === "success") {
        const { user, permissions } = getUserFromJSON(data.data.user);
        localStorage.setItem("token", data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        setGrantedPermissions(permissions);
        setUser(user);
        toast.success("Logged in successfully");
        navigate("/dashboard");
      } else {
        toast.error(data.message);
      }
    }).catch((error) => {
      toast.error(error.response?.data?.message || error.message);
    });
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <TimesLogo className="mx-auto h-20 w-auto" />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
                />
              </div>
              <div className="text-sm text-right">
                <a href="#" className="font-semibold text-gray-900 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
