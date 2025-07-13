
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UsernameInput } from "./UsernameInput";
import { adminLoginFormSchema } from "./formSchema";

type FormValues = z.infer<typeof adminLoginFormSchema>;

interface LoginFormFieldsProps {
  form: UseFormReturn<FormValues>;
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
}

export function LoginFormFields({ form, onSubmit, isLoading }: LoginFormFieldsProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-koperasi-dark/80 font-medium">Username</FormLabel>
              <FormControl>
                <UsernameInput field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-koperasi-dark/80 font-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-koperasi-gray" />
                  <input
                    type="password"
                    placeholder="Masukkan password"
                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-koperasi-green/50 focus:border-koperasi-green transition-all"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-koperasi-blue to-koperasi-green hover:from-koperasi-blue/90 hover:to-koperasi-green/90 transition-all duration-300 shadow-md mt-6 font-semibold" 
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </Form>
  );
}
