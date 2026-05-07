import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center mb-8">
                    <SignUp
                              appearance={{
                                          elements: {
                                                        rootBox: 'mx-auto',
                                                                      card: 'shadow-lg rounded-xl',
                                                                                  },
                                                                                            }}
                                                                                                    />
                                                                                                          </div>
                                                                                                              </div>
                                                                                                                );
                                                                                                                }
