import ApplyPropositionsExtensionView from "../../../src/view/actions/applyPropositions.jsx";

fdescribe("schema", () => {
  it("works", () => {

    const fields = [];

    const visitor = {
      visitComboBox({ key }) {
        fields.push(key);
      },
      visitConditional(keys, condition, ...parts) {
        parts.map(part => part.accept(visitor));
      },
      visitDataElement({ key }) {
        fields.push(key);
      },
      visitExtensionView(...parts) {
        parts.map(part => part.accept(visitor));
      },
      visitInstancePicker({ key }) {
        fields.push(key);
      },
      visitObjectArray({ key }, ...parts) {
        parts.map(part => part.accept(visitor));
      },
      visitRadioGroup({ key }) {
        fields.push(key);
      },
      visitStringArray({ key }) {
        fields.push(key);
      },
      visitTextField({ key }) {
        fields.push(key);
      }
    };

    const schema = ApplyPropositionsExtensionView.accept(visitor);
    console.log(schema);
  });
});
