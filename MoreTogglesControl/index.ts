import { IInputs, IOutputs } from "./generated/ManifestTypes";

import { v4 as uuidv4 } from 'uuid';

interface IOptionsLabel {
	TrueLable: string,
	FalseLable: string
}

interface IToggleProps {
	isDisabled: boolean,
	isVisible: boolean,
	currentValue: boolean | undefined,
	defaultValue: boolean | undefined,
	lables: IOptionsLabel,
	className: string,
	fontSize: number | null,
	isLableVisible: boolean
}

export class MoreTogglesControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private _container: HTMLDivElement;
	private _toggleWrapper: HTMLDivElement;
	private _notifyOutputChanged: () => void;
	private _checkBox: HTMLInputElement;
	private _customLable: HTMLDivElement;

	private toggleProps: IToggleProps;
	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
		this._notifyOutputChanged = notifyOutputChanged;

		this.toggleProps = {
			currentValue: context.parameters.boundField.raw,
			defaultValue: context.parameters.boundField.attributes?.DefaultValue,
			lables: {
				TrueLable: "Yes",
				FalseLable: "No"
			},
			isDisabled: context.mode.isControlDisabled,
			isVisible: context.mode.isVisible,
			isLableVisible: context.parameters.showLable.raw == "yes",
			className: context.parameters.toggleClass.raw ?? "mt-check-garden",
			fontSize: context.parameters.toggleSize.raw ?? 0
		}

		if (this.toggleProps.currentValue == undefined && this.toggleProps.defaultValue != null) {
			this.toggleProps.currentValue = this.toggleProps.defaultValue;
		}

		const optionsArray = context.parameters.boundField.attributes?.Options;

		if(optionsArray && optionsArray.length == 2){
			if(optionsArray[0].Value == 0) {
				this.toggleProps.lables.TrueLable = optionsArray[0].Label;
				this.toggleProps.lables.FalseLable = optionsArray[1].Label;
			} else {
				this.toggleProps.lables.TrueLable = optionsArray[1].Label;
				this.toggleProps.lables.FalseLable = optionsArray[0].Label;
			}
		}

		if(this.toggleProps.className.startsWith(".mt")) {
			this.toggleProps.className = this.toggleProps.className.substring(1);
		}

		if(!this.toggleProps.className.startsWith("mt")){
			this.toggleProps.className = "mt-check-garden";
		}

		this._container = document.createElement("div");
		this._container.className = "main-container";

		if(!this.toggleProps.isVisible) {
			this._container.classList.add("hidden");
		}

		const toggleWrapper = document.createElement("div");
		toggleWrapper.className = this.toggleProps.className;

		if (this.toggleProps.fontSize && this.toggleProps.fontSize != 0) {
			toggleWrapper.style.fontSize = `${this.toggleProps.fontSize}px`;
		}

		this._checkBox = document.createElement("input");
		this._checkBox.type = "checkbox";
		this._checkBox.style.padding = "0";
		this._checkBox.checked = this.toggleProps.currentValue as boolean;
		this._checkBox.id = context.parameters.boundField.attributes?.LogicalName ?? uuidv4();

		this._checkBox.addEventListener('change', (event) => {
			if (event.target && (event.target as HTMLInputElement).checked) {
				this.toggleProps.currentValue = true;
			} else {
				this.toggleProps.currentValue = false;
			}

			if(this.toggleProps.isLableVisible) {
				this._customLable.textContent = this.toggleProps.currentValue ? this.toggleProps.lables.TrueLable : this.toggleProps.lables.FalseLable;
			}
			this._notifyOutputChanged();
		});

		this._checkBox.disabled = this.toggleProps.isDisabled;

		const lable = document.createElement("label");
		lable.htmlFor = this._checkBox.id;

		toggleWrapper.appendChild(this._checkBox);
		toggleWrapper.appendChild(lable);

		this._container.appendChild(toggleWrapper);

		if(this.toggleProps.isLableVisible) {
			this._customLable = document.createElement("div");
			this._customLable.className = "main-container__lable";
			this._customLable.textContent = this.toggleProps.currentValue ? this.toggleProps.lables.TrueLable : this.toggleProps.lables.FalseLable;

			this._container.appendChild(this._customLable);

		}
		container.appendChild(this._container);
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		if (context.parameters.boundField.raw != this.toggleProps.currentValue) {
			this.toggleProps.currentValue = context.parameters.boundField.raw;
			this._checkBox.checked = this.toggleProps.currentValue;

			if(this.toggleProps.isLableVisible) {
				this._customLable.textContent = this.toggleProps.currentValue ? this.toggleProps.lables.TrueLable : this.toggleProps.lables.FalseLable;
			}
		}

		if (context.mode.isControlDisabled != this.toggleProps.isDisabled) {
			this.toggleProps.isDisabled = context.mode.isControlDisabled;
			this._checkBox.disabled = this.toggleProps.isDisabled;
		}

		if(context.mode.isVisible != this.toggleProps.isVisible){
			this.toggleProps.isVisible = context.mode.isVisible;

			if(this.toggleProps.isVisible){
				this._container.classList.remove("hidden");
			} else {
				this._container.classList.add("hidden");
			}
		}
	}

	/**
	 * It is called by the framework prior to a control receiving new data.
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			boundField: this.toggleProps.currentValue
		};
	}

	/**
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		// Add code to cleanup control if necessary
	}
}
