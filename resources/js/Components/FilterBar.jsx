import React from 'react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Icon from '@/Components/Icon';

export default function FilterBar({ 
    searchQuery = '', 
    onSearchChange, 
    onSubmit, 
    onReset, 
    searchPlaceholder = 'Cari...',
    children 
}) {
    return (
        <form onSubmit={onSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 md:items-center">
            <div className="w-full md:w-1/3">
                <TextInput
                    type="text"
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="w-full h-10"
                    placeholder={searchPlaceholder}
                />
            </div>
            
            {children && (
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    {/* Children are expected to add h-10 via className if needed, or we just align them */}
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, {
                                className: `${child.props.className || ''} h-10`
                            });
                        }
                        return child;
                    })}
                </div>
            )}

            <div className="flex items-center gap-2 w-full md:w-auto">
                <PrimaryButton type="submit" className="w-full md:w-auto justify-center h-10">
                    <Icon name="search" className="w-4 h-4 mr-1.5" /> Cari
                </PrimaryButton>
                <SecondaryButton type="button" onClick={onReset} className="w-full md:w-auto justify-center h-10">
                    Reset
                </SecondaryButton>
            </div>
        </form>
    );
}
