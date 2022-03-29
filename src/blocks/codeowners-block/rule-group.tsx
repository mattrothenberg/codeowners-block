interface RuleGroupProps {
  name: string;
}

export function RuleGroupComponent(props: RuleGroupProps, ref: any) {
  console.log(props);
  return <div ref={ref}>rule group</div>;
}
