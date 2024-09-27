import React, { ReactNode } from 'react';

interface SignInLayoutProps {
  children: ReactNode;
}

const SignInLayout = ({ children }: SignInLayoutProps) => {
    return (
        <div className="signin-layout">
            {children} {/* This will render the Sign-In component */}
        </div>
    );
};

export default SignInLayout;
