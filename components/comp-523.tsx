import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"

const steps = [
  { step: 1, title: "Upload" },
  { step: 2, title: "Crop" },
  { step: 3, title: "Analyze" },
  { step: 4, title: "Publish" },
]

export default function UploadStepper({ value }: { value: number }) {
  return (
    <div className="text-center">
      <Stepper value={value}>
        {steps.map(({ step, title }) => (
          <StepperItem
            key={step}
            step={step}
            className="not-last:flex-1 max-md:items-start"
          >
            <StepperTrigger className="rounded max-md:flex-col">
              <StepperIndicator />
              <div className="text-center md:text-left">
                <StepperTitle>{title}</StepperTitle>
              </div>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="max-md:mt-3.5 md:mx-4" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  )
}
