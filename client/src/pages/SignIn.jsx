import { SignIn } from "../auth/MockClerk";
import PageTransition from "../components/PageTransition";

const SignInPage = () => {
    return (
        <PageTransition>
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <SignIn signUpUrl="/sign-up" forceRedirectUrl="/" />
            </div>
        </PageTransition>
    );
};

export default SignInPage;
