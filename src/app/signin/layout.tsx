// app/auth/signin/layout.tsx
import React from 'react';

const SignInLayout = ({ children }) => {
    return (
        <div className="signin-layout">
            {children} {/* This will render the Sign-In component */}
        </div>
    );
};

export default SignInLayout;