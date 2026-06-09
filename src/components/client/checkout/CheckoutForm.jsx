'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema } from '@/lib/validators';

export default function CheckoutForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data) => {
    console.log('Order data:', data);
    // TODO: call orderService.create(data)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-8">
      <div className="space-y-4">
        <h2 className="font-bold text-lg">Shipping Info</h2>
        {[['firstName','First Name'],['lastName','Last Name'],['email','Email'],['phone','Phone'],['address','Address'],['city','City'],['postalCode','Postal Code']].map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input {...register(field)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
            {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field].message}</p>}
          </div>
        ))}
      </div>
      <div>
        <h2 className="font-bold text-lg mb-4">Payment</h2>
        <div className="border rounded-xl p-4 text-gray-400 text-sm mb-4">Stripe / payment gateway here</div>
        <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors">
          Place Order
        </button>
      </div>
    </form>
  );
}
