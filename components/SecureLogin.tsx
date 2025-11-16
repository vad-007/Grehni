import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './Spinner';

export const SecureLogin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithBiometrics } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        if (!password) {
            setError('Please enter your master password.');
            setIsLoading(false);
            return;
        }
        try {
            const success = await login(password);
            if (!success) {
                setError('Login failed. Please check your password.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometrics = async () => {
        setIsLoading(true);
        setError('');
        try {
            await loginWithBiometrics();
        } catch (err) {
             setError('Biometric login is not available or failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                     <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                        G
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800">Welcome to Grehni</h2>
                    <p className="text-center text-gray-500 mt-2 mb-6">Your secure financial vault.</p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Zero-Knowledge Security:</strong> Your password is used to encrypt your data on this device and is never sent to our servers.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Master Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="••••••••••••"
                                aria-required="true"
                                aria-invalid={!!error}
                                aria-describedby={error ? "password-error" : undefined}
                            />
                        </div>
                        {error && <p id="password-error" className="text-red-500 text-sm mb-4">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-300"
                        >
                            {isLoading ? <Spinner /> : 'Unlock Vault'}
                        </button>
                    </form>
                    <div className="my-4 flex items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                     <button
                        onClick={handleBiometrics}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1.5 1.5 0 00-1.5 1.5v3.354a4.485 4.485 0 00-2.433 2.822 1.5 1.5 0 00.17 1.414l.006.006a1.5 1.5 0 002.115.105l.004-.002a2.986 2.986 0 014.28 0l.004.002a1.5 1.5 0 002.115-.105l.006-.006a1.5 1.5 0 00.17-1.414A4.485 4.485 0 0011.5 6.854V3.5A1.5 1.5 0 0010 2zm-5.5 8.5a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5v-2a1.5 1.5 0 00-1.5-1.5h-11z" clipRule="evenodd" /></svg>
                        Sign in with Biometrics
                    </button>
                </div>
            </div>
        </div>
    );
};