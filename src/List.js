import {CreateElement} from "@levinelito/create-html-element";
import {DataFetch} from "./DataFetch.js";
import {DataSend} from "./DataSend.js";

class OptionList{
    constructor({target, data, dataURL, addURL, removeURL, onAdd, onRemove}) {
        this.target = document.querySelector(target);
        if(this.target.nodeName == "INPUT" || this.target.nodeName == "TEXTAREA"){
            this.targetIsInput = true;
        }

        if(dataURL){
            this.data = DataFetch({
               url      : dataURL,
               onfetched: (data)    => {this.data = data; this.RenderUI()},
               onfail   : (error)   => console.error(error)
            });
        } else if(data){
            this.data = data;
            this._RenderUI();
        } else {
            this.data = {added: [], available: []};
            this._RenderUI();
        }

        if(addURL){ this.addURL = addURL }
        if(removeURL){ this.removeURL = removeURL }
        if(onAdd && typeof onAdd === 'function'){ this.onAdd = onAdd }
        if(onRemove && typeof onRemove === 'function'){ this.onRemove = onRemove }
    }

    _AddItem(event) {
        let value       = event.currentTarget.parentNode.parentNode.parentNode.getAttribute('value'),
            available   = this.data.available,
            added       = this.data.added,
            data;

        if(typeof available[0] === 'object'){
            const values    = available.map(item => item.value),
                index       = values.indexOf(value);

            data = available[index];
            added.push(data);
            available.splice(index, 1);

            if(this.onAdd) this.onAdd(data);
        } else if(typeof available[0] === 'string') {
            available.splice(available.indexOf(value), 1);
            added.push(value);

            if(this.onAdd) this.onAdd(value);
        }

        let element = this.availableList.querySelector(`[value="${value}"]`),
            button  = element.querySelector('button'),
            icon    = button.querySelector('i');

        this.addedList.insertBefore(element, this.CustomInput);
        button.classList.remove('is-primary');
        icon.classList.remove('fa-plus');
        button.classList.add('is-danger');
        icon.classList.add('fa-minus');

        if(this.addURL) {
            let data = new FormData;
            data.append('value', value);
            DataSend({
                url         : this.addURL,
                onsuccess   : data  => console.log(data),
                onfail      : error => console.error(error),
                options     : {
                    method  : 'POST',
                    headers : {
                        'X-Requested-With'  : 'XMLHttpRequest',
                        'X-CSRF-TOKEN'      : document.querySelector('meta[name="_token"]').getAttribute('content')
                    },
                    body    : data
                }
            });
        }
    }

    _CreateCustomItem() {
        let content = (this.DataIsObject ? `
        <a>
        <form>
            <div class="field">
                <label class="label" for="label">Nama</label>
                <div class="control">
                    <input type="text" name="label" class="input"/>
                </div>
            </div>
            <div class="field">
                <label class="label" for="value">Nilai</label>
                <div class="control">
                    <input type="text" name="value" class="input"/>
                </div>
            </div>
            <input type="submit" value="Tambah" class="button is-primary"/>
        </form></a>
        ` : `<a>
        <form>
            <div class="field">
                <label class="label" for="label">Nama</label>
                <div class="control">
                    <input type="text" name="value" class="input"/>
                </div>
            </div>
            <input type="submit" value="Tambah" class="button is-primary"/>
        </form></a>
        `),
            input = CreateElement({
                tagname: 'li',
                content: content
            });

        input.querySelector('form').addEventListener('submit', event => {
            event.preventDefault();
            if(this.DataIsObject){
                let label = input.querySelector('input[name="label"]').value;
                let value = input.querySelector('input[name="value"]').value;
                this._InsertCustomItem({label: label, value: value});
            } else {
                let value = input.querySelector('input[name="value"]').value;
                this._InsertCustomItem({value: value});
            }
            input.parentNode.removeChild(input);
            input = null;
        });

        this.addedList.insertBefore(input, this.CustomInput)
    }

    _InsertCustomItem({label, value}) {
        let item = CreateElement({
                tagname: 'li',
                attributes: {
                    value: value,
                    isCustom: true
                },
                content: `
                <a class="columns is-mobile">
                    <div class="column">${(label ? label : value)}</div>
                    <div class="column is-narrow">
                        <button class="button is-danger">
                            <span class="icon">
                                <i class="fas fa-minus"></i>
                            </span>
                        </button>
                    </div>
                </a>`
            }),
            list = this.data.added,
            data;
        if (this.DataIsObject){
            data = {
                value: value,
                label: label ? label : value
            };
        } else {
            data = value;
        }
        list.push(data);
        item.querySelector('button').addEventListener('click', event => this._MoveItem(event));

        this.addedList.insertBefore(item, this.CustomInput);

        if(this.targetIsInput){
            this.target.value = JSON.stringify(this.data.added)
        }
    }

    _MoveItem(event) {
        let target = event.currentTarget;
        while(target.nodeName != 'UL'){
            target = target.parentNode;
        }
        if(target == this.addedList) {
            this._RemoveItem(event);
        } else if(target == this.availableList){
            this._AddItem(event);
        }
        if(this.targetIsInput){
            this.target.value = JSON.stringify(this.data.added)
        }
    }

    _PopulateList(list, data = []) {
        let error = false, errorMessage = '';
        data.forEach(item => {
            if(!error){
                let ItemData = {label: '', value: ''}

                if (typeof item === 'object'){
                    if(Object.hasOwnProperty.call(item), 'label') {
                        ItemData.label = item.label;
                    }

                    if(Object.hasOwnProperty.call(item, 'value')) {
                        this.DataIsObject = true;
                        ItemData.value = item.value;
                        if(ItemData.label == '') ItemData.label = item.value;
                    } else {
                        error = true;
                        errorMessage = "Incorrect data format";
                    }
                } else {
                    ItemData.label = ItemData.value = item;
                }
                if(!error) {
                    let button = (list == this.availableList ? {icon: 'plus', class: 'primary'} : {icon: 'minus', class: 'danger'});
                    const ListItem = CreateElement({
                            tagname: 'li',
                            attributes: {
                                value: ItemData.value
                            },
                            content: `
                            <a class="columns is-mobile is-multiline">
                                <div class="column">${ItemData.label}</div>
                                <div class="column is-narrow">
                                    <button type="button" class="button is-${button.class}">
                                        <span class="icon">
                                            <i class="fas fa-${button.icon}"></i>
                                        </span>
                                    </button>
                                </div>
                            </a>`
                        });
                    
                    ListItem.querySelector('button').addEventListener('click', event => this._MoveItem(event));

                    list.append(ListItem);
                }
            }
        });

        if(error) {
            console.error(errorMessage);
            list.append(errorMessage);
            return;
        }

        if(list == this.addedList){
            const NewCustomItem = this.CustomInput = CreateElement({
                name: 'li',
                attributes: {
                    value: 'create-new'
                },
                content: `
                <a class="columns is-mobile is-multiline">
                    <div class="column is-narrow">
                        <span class="icon-text"
                            <span class="icon">
                                <i class="fas fa-plus"></i>
                            </span>
                            <span>Buat Baru</span>
                        </span>
                    </div>
                </a>
                `
            });
            NewCustomItem.addEventListener('click', event => this._CreateCustomItem());
            list.append(NewCustomItem);
        }
    }

    _RemoveItem(event) {
        let value       = event.currentTarget.parentNode.parentNode.parentNode.getAttribute('value'),
            isCustom    = event.currentTarget.parentNode.parentNode.parentNode.hasAttribute('isCustom'),
            available = this.data.available,
            added   = this.data.added,
            data;

        if(typeof added[0] === 'object'){
            const values    = added.map(item => item.value),
                index       = values.indexOf(value);

            data = added[index];
            if(!isCustom) available.push(data);

            added.splice(index, 1);

            if(this.onRemove) this.onRemove(data);
        } else if(typeof added[0] === 'string') {
            added.splice(added.indexOf(value), 1);
            if(!isCustom) available.push(value);

            if(this.onRemove) this.onRemove(value);
        }

        let element = this.addedList.querySelector(`[value="${value}"]`),
            button  = element.querySelector('button'),
            icon    = button.querySelector('i');
        if(!isCustom){
            this.availableList.append(element);
            button.classList.remove('is-danger');
            icon.classList.remove('fa-minus');
            button.classList.add('is-primary');
            icon.classList.add('fa-plus');
        } else {
            this.addedList.removeChild(element);
        }

        if(this.removeURL) {
            let data = new FormData;
            data.append('value', value);
            DataSend({
                url         : this.removeURL,
                onsuccess   : data  => console.log(data),
                onfail      : error => console.error(error),
                options     : {
                    method  : 'POST',
                    headers : {
                        'X-Requested-With'  : 'XMLHttpRequest',
                        'X-CSRF-TOKEN'      : document.querySelector('meta[name="_token"]').getAttribute('content')
                    },
                    body    : data
                }
            });
        }
    }

    _RenderUI() {
        const mainContainer = CreateElement({ classnames: 'container' }),
            row = CreateElement({ classnames: 'columns is-multiline ' }),
            addedPanel = CreateElement({
                classnames: 'column is-12 is-6-desktop mb-5 px-4',
            }),
            availablePanel = CreateElement({
                classnames: 'column is-12 is-6-desktop mb-5 px-4',
            }),
            addedBox = CreateElement({
                classnames: 'box menu',
                attributes: {
                    style: 'height: 300px; overflow: auto'
                }, 
            }),
            availableBox = CreateElement({
                classnames: 'box menu',
                attributes: {
                    style: 'height: 300px; overflow: auto'
                },
                
            }),
            addedList = this.addedList = CreateElement({
                tagname: 'ul',
                classnames: 'menu-list',
            }),
            availableList = this.availableList = CreateElement({
                tagname: 'ul',
                classnames: 'menu-list',
            });

        this._PopulateList(addedList, this.data.added);
        this._PopulateList(availableList, this.data.available);

        if(this.data.available.length && this.targetIsInput) {
            this.target.value = JSON.stringify(this.data.added)
        }
        
        addedBox.append(addedList);
        availableBox.append(availableList);
        addedPanel.append(addedBox);
        availablePanel.append(availableBox);
        row.append(availablePanel);
        row.append(addedPanel);
        mainContainer.append(row);

        if(this.targetIsInput){
            this.target.type = 'hidden';
            this.target.parentNode.insertBefore(mainContainer, this.target);
        } else {
            this.target.append(mainContainer);
        }
    }

    get getData() {
        return {added: this.data.added, available: this.data.available};
    }
}

export {OptionList};