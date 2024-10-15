import { Button, Dialog, DialogTrigger, Breadcrumbs, Item, Heading, Content, ButtonGroup } from "@adobe/react-spectrum";
import { createContext, useContext } from "react";

const BreadcrumbContext = createContext(null);

const FullscreenModal = ({ children, title, triggerLabel, validate = () => true, getSettings = () => undefined, setSettings = () => undefined }) => {
  const levels = useContext(BreadcrumbContext);

  return (
    <DialogTrigger type="fullscreenTakeover" isDismissable>
      <Button>{triggerLabel}</Button>
      {(close) => {
        let savedSettings;
        const newLevels = [...levels, { title, close, validate }];
        const onAction = (iString) => {
          const i = Number(iString);
          for (let j = newLevels.length - 1; j > i; j--) {
            newLevels[j].close();
          }
        }
        const onOpenChange = (isOpen) => {
          if (isOpen) {
            savedSettings = getSettings();
          } else {
            setSettings(savedSettings);
          }
        }
        const onSave = () => {
          if (validate()) {
            savedSettings = getSettings();
            close();
          }
        }
        return (
          <Dialog onDismiss={() => console.log("dismissed")}>
            <Heading>
              <Breadcrumbs onAction={onAction}>
                {levels.map(({ title }, i) => <Item key={i}>{title}</Item>)}
                <Item key={levels.length}>{title}</Item>
              </Breadcrumbs>
            </Heading>
            <Content>
              <BreadcrumbContext.Provider value={newLevels}>
                {children}
              </BreadcrumbContext.Provider>
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>Cancel</Button>
                <Button variant="accent" onPress={onSave} autoFocus>Save</Button>
              </ButtonGroup>
            </Content>
          </Dialog>
        );
      }}
    </DialogTrigger>
  );
}

FullscreenModal.Base = ({ children, title }) => {
  return (
    <>
      <Breadcrumbs>
        <Item>{title}</Item>
      </Breadcrumbs>
      <BreadcrumbContext.Provider value={[{ title }]}>
        {children}
      </BreadcrumbContext.Provider>
    </>
  );
};

export default FullscreenModal;

